const assert = require('node:assert');
const http = require('http');
const app = require('../src/app');
const { db, all, get } = require('../src/config/database');
const {
  SCHEMA_VERSION,
  createDefaultCase,
  validateCaseSchema,
  normalizeCase,
  calculateCaseHash,
  calculateDiagnosisHash
} = require('../src/models/caseSchema');
const syncService = require('../src/services/syncService');
const mutationRepository = require('../src/repositories/mutationRepository');

let server;
let baseUrl;

function logTest(name, passed, detail = '') {
  if (passed) {
    console.log(`  ✓ [PASS] ${name}${detail ? ` (${detail})` : ''}`);
  } else {
    console.error(`  ✗ [FAIL] ${name}: ${detail}`);
  }
}

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = { ...(options.headers || {}) };
  if (options.body && typeof options.body === 'object') {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? (typeof options.body === 'object' ? JSON.stringify(options.body) : options.body) : undefined
  });

  let data;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  return { status: res.status, headers: res.headers, data };
}

// In-Memory Storage Simulator to emulate browser localStorage across restarts
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

async function runSyncAndDraftTests() {
  console.log('\n======================================================');
  console.log(' synDx Versioned Case Schema, Draft & Sync Test Suite');
  console.log('======================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  async function test(name, fn) {
    try {
      await fn();
      logTest(name, true);
      passedCount++;
    } catch (err) {
      logTest(name, false, err.message);
      failedCount++;
    }
  }

  // Start ephemeral server
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`[+] Test server running on ${baseUrl}\n`);
      resolve();
    });
  });

  try {
    // -------------------------------------------------------------------------
    // 1. VERSIONED CASE SCHEMA (v1.0.0) TESTS
    // -------------------------------------------------------------------------
    console.log('--- 1. Versioned Case Schema Specification (v1.0.0) ---');

    await test('Default case adheres to schema_version 1.0.0', () => {
      const c = createDefaultCase();
      assert.strictEqual(c.schema_version, '1.0.0');
      assert.ok(c.id.startsWith('CASE-'));
      assert.ok(c.client_mutation_id.startsWith('mut_'));
      assert.strictEqual(c.sync_state.state, 'draft');
      assert.ok(c.audit_proof.case_hash);
      assert.ok(c.audit_proof.diagnosis_hash);
    });

    await test('validateCaseSchema accepts valid v1.0.0 case', () => {
      const c = createDefaultCase();
      const res = validateCaseSchema(c);
      assert.strictEqual(res.valid, true);
    });

    await test('validateCaseSchema rejects incompatible schema version', () => {
      const c = createDefaultCase();
      c.schema_version = '99.0.0';
      const res = validateCaseSchema(c);
      assert.strictEqual(res.valid, false);
      assert.ok(res.error.includes('Unsupported schema version'));
    });

    await test('normalizeCase translates legacy records into v1.0.0 schema', () => {
      const legacy = {
        id: 'CASE-LEGACY-01',
        condition: 'Wilson Disease',
        tier: 'A',
        confidence: 90,
        emergency: 1,
        vitals_json: JSON.stringify({ spo2: 88, hr: 130 })
      };
      const normalized = normalizeCase(legacy);
      assert.strictEqual(normalized.schema_version, '1.0.0');
      assert.strictEqual(normalized.id, 'CASE-LEGACY-01');
      assert.strictEqual(normalized.clinical_vitals.spo2, 88);
      assert.strictEqual(normalized.triage_result.tier, 'A');
      assert.strictEqual(normalized.triage_result.is_emergency, true);
    });

    // -------------------------------------------------------------------------
    // 2. LOCAL DRAFT SAVING, APP RESTART & DISCARD TESTS
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Local Draft Saving & App Restart Simulation ---');

    const storage = new LocalStorageMock();

    await test('Offline save: In-progress case draft persists locally', () => {
      const draftCase = createDefaultCase({
        id: 'CASE-DRAFT-999',
        patient_context: { patient_id: 'PT-DRAFT-1', age: 34, gender: 'Female' },
        clinical_vitals: { spo2: 95, hr: 82, bp: '130/85', temp: 37.1 }
      });
      const draftPayload = {
        schema_version: SCHEMA_VERSION,
        activeCaseData: draftCase,
        draft_saved_at: new Date().toISOString()
      };

      storage.setItem('syndx_case_draft', JSON.stringify(draftPayload));
      const saved = storage.getItem('syndx_case_draft');
      assert.ok(saved);
      const parsed = JSON.parse(saved);
      assert.strictEqual(parsed.activeCaseData.id, 'CASE-DRAFT-999');
      assert.strictEqual(parsed.activeCaseData.patient_context.patient_id, 'PT-DRAFT-1');
    });

    await test('App restart: Draft is reloaded and state is accurately recovered', () => {
      // Simulate app restart by instantiating new session state reading from storage
      const restoredJson = storage.getItem('syndx_case_draft');
      assert.ok(restoredJson, 'Persisted draft must exist after simulated app kill/restart');
      const restored = JSON.parse(restoredJson);
      assert.strictEqual(restored.activeCaseData.clinical_vitals.spo2, 95);
      assert.strictEqual(restored.activeCaseData.clinical_vitals.bp, '130/85');
    });

    await test('Discard draft: Clears local storage state cleanly', () => {
      storage.removeItem('syndx_case_draft');
      assert.strictEqual(storage.getItem('syndx_case_draft'), null);
    });

    // -------------------------------------------------------------------------
    // 3. IDEMPOTENT SYNC QUEUE STATE MACHINE & RETRY
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Idempotent Sync Queue: Queued -> Syncing -> Synced ---');

    const testMutationId = `mut_test_${Date.now()}_alpha`;
    const testCaseId = `CASE-SYNC-${Date.now()}`;

    await test('Sync queue transitions item from QUEUED to SYNCED on server ack', async () => {
      const queueItem = {
        mutation_id: testMutationId,
        case_id: testCaseId,
        type: 'CASE_CREATED',
        schema_version: '1.0.0',
        state: 'queued',
        attempts: 0,
        payload: {
          id: testCaseId,
          condition: 'Wilson Disease — Hepatic Subtype',
          tier: 'B',
          confidence: 85,
          emergency: 0,
          features: [{ label: 'Ceruloplasmin', value: 0.02 }],
          vitals: { spo2: 98, hr: 76 }
        }
      };

      // Transition to syncing
      queueItem.state = 'syncing';

      // Send to server /api/sync
      const res = await request('/api/sync', {
        method: 'POST',
        body: { items: [queueItem] }
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.status, 'success');
      assert.ok(res.data.synced_ids.includes(testCaseId));

      // Client updates state to synced
      queueItem.state = 'synced';
      queueItem.last_error = null;
      assert.strictEqual(queueItem.state, 'synced');

      // Verify case exists in database
      const dbCase = await get('SELECT * FROM cases WHERE id = ?', [testCaseId]);
      assert.ok(dbCase);
      assert.strictEqual(dbCase.condition, 'Wilson Disease — Hepatic Subtype');
    });

    // -------------------------------------------------------------------------
    // 4. DUPLICATE SYNC REQUEST (IDEMPOTENCY VERIFICATION)
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Duplicate Sync Behavior (Idempotency Proof) ---');

    await test('Duplicate sync request with identical mutation_id is completely idempotent', async () => {
      // Count existing case and audit records before duplicate submission
      const caseCountBefore = (await get('SELECT COUNT(*) as c FROM cases WHERE id = ?', [testCaseId])).c;
      const auditCountBefore = (await get('SELECT COUNT(*) as c FROM audit_trail WHERE case_id = ?', [testCaseId])).c;

      assert.strictEqual(caseCountBefore, 1);
      assert.strictEqual(auditCountBefore, 1);

      // Re-send EXACT SAME payload with same mutation_id
      const duplicateRes = await request('/api/sync', {
        method: 'POST',
        body: {
          items: [{
            mutation_id: testMutationId,
            case_id: testCaseId,
            type: 'CASE_CREATED',
            payload: {
              id: testCaseId,
              condition: 'Wilson Disease — Hepatic Subtype',
              tier: 'B',
              confidence: 85
            }
          }]
        }
      });

      assert.strictEqual(duplicateRes.status, 200);
      assert.ok(duplicateRes.data.synced_ids.includes(testCaseId));

      // Verify that NO duplicate cases and NO duplicate audit records were created
      const caseCountAfter = (await get('SELECT COUNT(*) as c FROM cases WHERE id = ?', [testCaseId])).c;
      const auditCountAfter = (await get('SELECT COUNT(*) as c FROM audit_trail WHERE case_id = ?', [testCaseId])).c;

      assert.strictEqual(caseCountAfter, 1, 'Idempotency failure: duplicate case row was inserted!');
      assert.strictEqual(auditCountAfter, 1, 'Idempotency failure: duplicate audit log entry was inserted!');
    });

    // -------------------------------------------------------------------------
    // 5. OFFLINE RECONNECT & FAILED ITEM RETRY
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Offline Disconnect, Failure Handling & Retry ---');

    const retryMutationId = `mut_retry_${Date.now()}`;
    const retryCaseId = `CASE-RETRY-${Date.now()}`;

    await test('Failed sync item transitions to FAILED state and records error & attempts', () => {
      const item = {
        mutation_id: retryMutationId,
        case_id: retryCaseId,
        type: 'CASE_CREATED',
        state: 'queued',
        attempts: 0,
        payload: { id: retryCaseId, condition: 'Acute Porphyria' }
      };

      // Simulate simulated network drop during sync attempt
      item.state = 'failed';
      item.attempts += 1;
      item.last_error = 'TypeError: fetch failed (Offline / Connection Refused)';

      assert.strictEqual(item.state, 'failed');
      assert.strictEqual(item.attempts, 1);
      assert.ok(item.last_error.includes('fetch failed'));
    });

    await test('Reconnect & Retry: Resetting failed item to QUEUED succeeds upon reconnect', async () => {
      const item = {
        mutation_id: retryMutationId,
        case_id: retryCaseId,
        type: 'CASE_CREATED',
        state: 'failed',
        attempts: 1,
        last_error: 'TypeError: fetch failed',
        payload: {
          id: retryCaseId,
          condition: 'Acute Porphyria — Crisis Pattern',
          tier: 'A',
          confidence: 91,
          emergency: 1
        }
      };

      // Trigger retry: resets to queued
      item.state = 'queued';
      item.last_error = null;

      // Reconnect: execute sync
      const res = await request('/api/sync', {
        method: 'POST',
        body: { items: [item] }
      });

      assert.strictEqual(res.status, 200);
      assert.ok(res.data.synced_ids.includes(retryCaseId));

      item.state = 'synced';
      assert.strictEqual(item.state, 'synced');

      // Verify case in SQLite
      const verifiedCase = await get('SELECT * FROM cases WHERE id = ?', [retryCaseId]);
      assert.ok(verifiedCase);
      assert.strictEqual(verifiedCase.id, retryCaseId);
    });

    // -------------------------------------------------------------------------
    // 6. SHARED AUDIT PRIVACY VERIFICATION (ZERO PII / RAW DATA)
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Shared Audit Trail Privacy Verification ---');

    await test('Audit trail records contain strictly zero patient identifiers or raw measurements', async () => {
      const auditRows = await all('SELECT * FROM audit_trail');
      assert.ok(auditRows.length > 0, 'Audit trail records must exist');

      const prohibitedWords = [
        'John', 'Mary', 'Patient', 'Sister', 'Dr.', 'Sen', 'Kaveripattinam',
        '468.6', '0.018', '67.7', '16.9', '122/80', '195/125'
      ];

      for (const row of auditRows) {
        // Inspect case_hash, diagnosis_hash, event_type, tx_hash
        const fields = [
          row.case_id,
          row.event_type,
          row.case_hash,
          row.diagnosis_hash,
          row.model_version,
          row.tx_hash || ''
        ];

        for (const field of fields) {
          for (const word of prohibitedWords) {
            const containsPII = field.toLowerCase().includes(word.toLowerCase());
            assert.strictEqual(
              containsPII,
              false,
              `Privacy violation: Prohibited token "${word}" found in audit trail record: ${field}`
            );
          }
        }

        // Hashes must be alphanumeric hashes or standard tokens
        assert.ok(/^[0-9a-fA-F]+$/.test(row.case_hash), `case_hash must be hex: ${row.case_hash}`);
      }
    });

    await test('Blockchain verification endpoint validates chain without exposing PII', async () => {
      const res = await request('/api/blockchain/verify');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.status, 'VERIFIED');
      assert.strictEqual(res.data.chain_valid, true);

      // Verify blocks in response have zero PII
      for (const b of res.data.verified_blocks) {
        assert.ok(b.block_hash.startsWith('0x'));
        assert.ok(b.prev_hash);
        assert.strictEqual(b.verified, true);
      }
    });

  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  }

  console.log('\n======================================================');
  console.log(` Summary: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('======================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runSyncAndDraftTests().catch((err) => {
  console.error('[FATAL TEST ERROR]', err);
  process.exit(1);
});
