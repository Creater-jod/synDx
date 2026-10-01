const assert = require('node:assert');
const http = require('http');
const app = require('../src/app');

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

  return {
    status: res.status,
    headers: res.headers,
    data
  };
}

async function runTests() {
  console.log('\n======================================================');
  console.log(' synDx Express Backend Refactored Architecture Test Suite');
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

  // 1. Start ephemeral server
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`[+] Test server running on ${baseUrl}\n`);
      resolve();
    });
  });

  try {
    // SECTION 1: SYSTEM HEALTH & SECURITY HEADERS
    console.log('--- 1. Security Headers & System Health ---');
    await test('Security headers are present on responses', async () => {
      const res = await request('/api/health');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff');
      assert.strictEqual(res.headers.get('x-frame-options'), 'SAMEORIGIN');
      assert.strictEqual(res.headers.get('x-xss-protection'), '1; mode=block');
      assert.strictEqual(res.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
      assert.strictEqual(res.headers.get('x-powered-by'), null);
    });

    await test('GET /api/health returns operational status', async () => {
      const res = await request('/api/health');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.status, 'online');
      assert.strictEqual(res.data.version, '1.0.0');
      assert.ok(res.data.emergency_engine);
      assert.ok(res.data.referral_engine);
      assert.ok(res.data.blockchain_audit);
    });

    // SECTION 2: CORS RESTRICTION
    console.log('\n--- 2. CORS Restriction & Origin Validation ---');
    await test('CORS allows requests from allowed origin', async () => {
      const res = await request('/api/health', {
        headers: { Origin: 'http://localhost:3000' }
      });
      assert.strictEqual(res.headers.get('access-control-allow-origin'), 'http://localhost:3000');
    });

    await test('CORS preflight rejects disallowed origin with 403', async () => {
      const res = await request('/api/cases', {
        method: 'OPTIONS',
        headers: { Origin: 'https://evil-untrusted-site.com' }
      });
      assert.strictEqual(res.status, 403);
    });

    // SECTION 3: REQUEST BODY VALIDATION (400 BAD REQUEST)
    console.log('\n--- 3. Request Body Validation Middleware ---');
    await test('POST /api/auth/login with missing fields returns 400', async () => {
      const res = await request('/api/auth/login', {
        method: 'POST',
        body: { username: '' }
      });
      assert.strictEqual(res.status, 400);
      assert.ok(res.data.error.includes('required'));
    });

    await test('POST /api/auth/register with missing fields returns 400', async () => {
      const res = await request('/api/auth/register', {
        method: 'POST',
        body: { username: 'testuser' }
      });
      assert.strictEqual(res.status, 400);
      assert.ok(res.data.error.includes('required'));
    });

    await test('POST /api/cases with missing condition returns 400', async () => {
      const res = await request('/api/cases', {
        method: 'POST',
        body: { tier: 'A', confidence: 90 }
      });
      assert.strictEqual(res.status, 400);
      assert.ok(res.data.error.includes('condition'));
    });

    await test('POST /api/cases with invalid tier returns 400', async () => {
      const res = await request('/api/cases', {
        method: 'POST',
        body: { condition: 'Wilson Disease', tier: 'Z', confidence: 90 }
      });
      assert.strictEqual(res.status, 400);
      assert.ok(res.data.error.includes('tier'));
    });

    await test('POST /api/cases/:id/decision with invalid status returns 400', async () => {
      const res = await request('/api/cases/CASE-8F3A1C/decision', {
        method: 'POST',
        body: { status: 'invalid-decision' }
      });
      assert.strictEqual(res.status, 400);
      assert.ok(res.data.error.includes('Invalid status decision'));
    });

    await test('POST /api/sync with non-array payload returns 400', async () => {
      const res = await request('/api/sync', {
        method: 'POST',
        body: { items: 'not-an-array' }
      });
      assert.strictEqual(res.status, 400);
      assert.ok(res.data.error.includes('Expected array of items'));
    });

    // SECTION 4: AUTHENTICATION & JWT PROTECTION
    console.log('\n--- 4. Authentication & JWT Authorization ---');
    let doctorToken = '';
    await test('POST /api/auth/login with invalid password returns 401', async () => {
      const res = await request('/api/auth/login', {
        method: 'POST',
        body: { username: 'doctor', password: 'wrongpassword' }
      });
      assert.strictEqual(res.status, 401);
      assert.ok(res.data.error.includes('Invalid username or password'));
    });

    await test('POST /api/auth/login with valid credentials returns JWT token', async () => {
      const res = await request('/api/auth/login', {
        method: 'POST',
        body: { username: 'doctor', password: 'password123' }
      });
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.token);
      assert.strictEqual(res.data.user.username, 'doctor');
      assert.strictEqual(res.data.user.role, 'doctor');
      assert.strictEqual(res.data.user.password_hash, undefined, 'Password hash must never leak in responses');
      doctorToken = res.data.token;
    });

    await test('GET /api/auth/me without token returns 401', async () => {
      const res = await request('/api/auth/me');
      assert.strictEqual(res.status, 401);
      assert.ok(res.data.error.includes('Authentication token required'));
    });

    await test('GET /api/auth/me with invalid token returns 403', async () => {
      const res = await request('/api/auth/me', {
        headers: { Authorization: 'Bearer thisisafaketoken12345' }
      });
      assert.strictEqual(res.status, 403);
      assert.ok(res.data.error.includes('Invalid or expired token'));
    });

    await test('GET /api/auth/me with valid token returns user profile', async () => {
      const res = await request('/api/auth/me', {
        headers: { Authorization: `Bearer ${doctorToken}` }
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.user.username, 'doctor');
      assert.strictEqual(res.data.user.role, 'doctor');
    });

    // SECTION 5: CLINICAL CASE MANAGEMENT & PARAMETERIZED QUERIES
    console.log('\n--- 5. Case Management & Parameterized SQL ---');
    let createdCaseId = '';
    await test('GET /api/cases returns list of cases with parsed JSON structures', async () => {
      const res = await request('/api/cases');
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data));
      assert.ok(res.data.length > 0);
      const first = res.data[0];
      assert.ok(first.id);
      assert.ok(first.condition);
      assert.ok(Array.isArray(first.features));
      assert.strictEqual(typeof first.vitals, 'object');
    });

    await test('POST /api/cases creates new case with cryptographic hashes', async () => {
      const res = await request('/api/cases', {
        method: 'POST',
        body: {
          condition: 'Wilson Disease — Neurological Presentation',
          tier: 'A',
          confidence: 94,
          emergency: 1,
          features: [{ label: 'Ceruloplasmin', value: 0.015 }],
          vitals: { spo2: 95, hr: 88, bp: '120/80', temp: 36.8 }
        }
      });
      assert.strictEqual(res.status, 201);
      assert.ok(res.data.id);
      createdCaseId = res.data.id;
    });

    await test('GET /api/cases/:id retrieves created case', async () => {
      const res = await request(`/api/cases/${createdCaseId}`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.id, createdCaseId);
      assert.strictEqual(res.data.condition, 'Wilson Disease — Neurological Presentation');
      assert.strictEqual(res.data.tier, 'A');
      assert.strictEqual(res.data.confidence, 94);
      assert.strictEqual(res.data.emergency, true);
    });

    await test('POST /api/cases/:id/decision updates case status and logs audit event', async () => {
      const res = await request(`/api/cases/${createdCaseId}/decision`, {
        method: 'POST',
        body: {
          status: 'confirmed',
          note: 'Neurological symptoms and ceruloplasmin confirm diagnosis.'
        }
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.status, 'confirmed');

      // Verify update persisted
      const verifyRes = await request(`/api/cases/${createdCaseId}`);
      assert.strictEqual(verifyRes.data.status, 'confirmed');
      assert.ok(verifyRes.data.note.includes('confirm diagnosis'));
    });

    // SECTION 6: DETERMINISTIC EMERGENCY RULES ENGINE
    console.log('\n--- 6. Deterministic Emergency Vitals Engine ---');
    await test('POST /api/emergency/evaluate flags SpO2 < 90 as critical hypoxia', async () => {
      const res = await request('/api/emergency/evaluate', {
        method: 'POST',
        body: { spo2: 86, hr: 80, bp: '120/80', temp: 37.0 }
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.is_emergency, true);
      assert.strictEqual(res.data.recommended_tier, 'A');
      assert.ok(res.data.triggers.some(t => t.includes('Critical Hypoxia')));
    });

    await test('POST /api/emergency/evaluate flags hypertensive crisis', async () => {
      const res = await request('/api/emergency/evaluate', {
        method: 'POST',
        body: { spo2: 98, hr: 75, bp: '195/125', temp: 36.8 }
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.is_emergency, true);
      assert.ok(res.data.triggers.some(t => t.includes('Hypertensive Crisis')));
    });

    await test('POST /api/emergency/evaluate normal vitals return standard protocol', async () => {
      const res = await request('/api/emergency/evaluate', {
        method: 'POST',
        body: { spo2: 99, hr: 72, bp: '118/76', temp: 36.6 }
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.is_emergency, false);
      assert.strictEqual(res.data.recommended_tier, 'B');
      assert.strictEqual(res.data.triggers.length, 0);
    });

    // SECTION 7: REFERRALS & HEALTHCARE ECONOMICS
    console.log('\n--- 7. Referrals & Healthcare Economics ---');
    await test('GET /api/facilities returns clinical facilities ordered by distance', async () => {
      const res = await request('/api/facilities');
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data));
      assert.ok(res.data.length >= 6);
      assert.strictEqual(res.data[0].id, 'FAC-01');
    });

    await test('POST /api/referrals/match returns scored recommendations', async () => {
      const res = await request('/api/referrals/match', {
        method: 'POST',
        body: { condition: 'Wilson Disease', is_emergency: false }
      });
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.recommended);
      assert.ok(res.data.recommended.name);
      assert.ok(Array.isArray(res.data.alternatives));
    });

    await test('GET /api/cost/estimate returns breakdown & government grants', async () => {
      const res = await request('/api/cost/estimate?condition=wilson_disease&insurance_pct=70');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.total_estimated_cost, 75000);
      assert.strictEqual(res.data.insurance_covered_amount, 52500);
      assert.strictEqual(res.data.estimated_out_of_pocket, 22500);
      assert.ok(res.data.government_schemes.nprd_2021);
      assert.ok(res.data.government_schemes.pmjay);
    });

    // SECTION 8: OFFLINE SYNC BATCHING
    console.log('\n--- 8. Offline Synchronization Batch Engine ---');
    await test('POST /api/sync processes offline queue items', async () => {
      const syncCaseId = `SYNC-TEST-${Date.now()}`;
      const res = await request('/api/sync', {
        method: 'POST',
        body: {
          items: [
            {
              type: 'CASE_CREATED',
              payload: {
                id: syncCaseId,
                condition: 'Marfan Syndrome',
                tier: 'B',
                confidence: 85,
                emergency: false
              }
            },
            {
              type: 'DECISION_MADE',
              payload: {
                id: syncCaseId,
                status: 'more-tests',
                note: 'Echocardiogram requested.'
              }
            }
          ]
        }
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.status, 'success');
      assert.strictEqual(res.data.processed, 2);
      assert.ok(res.data.synced_ids.includes(syncCaseId));

      // Verify sync case in database
      const verifyRes = await request(`/api/cases/${syncCaseId}`);
      assert.strictEqual(verifyRes.data.id, syncCaseId);
      assert.strictEqual(verifyRes.data.status, 'more-tests');
    });

    // SECTION 9: BLOCKCHAIN AUDIT LEDGER & CRYPTOGRAPHIC VERIFICATION
    console.log('\n--- 9. Blockchain Audit Ledger & Verification ---');
    await test('GET /api/audit returns descending audit trail events', async () => {
      const res = await request('/api/audit');
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data));
      assert.ok(res.data.length > 0);
      assert.ok(res.data[0].case_id);
      assert.ok(res.data[0].event_type);
    });

    await test('GET /api/blockchain/verify cryptographically verifies block chain integrity', async () => {
      const res = await request('/api/blockchain/verify');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.status, 'VERIFIED');
      assert.strictEqual(res.data.chain_valid, true);
      assert.ok(res.data.blocks_count > 0);
      assert.ok(res.data.latest_block_hash.startsWith('0x'));
      assert.strictEqual(res.data.consensus_protocol, 'Proof of Authority (PoA) - Medical Audit Node Consortium');
      assert.ok(Array.isArray(res.data.verified_blocks));
    });

    // SECTION 10: ML SERVICE INTEGRATION & SEPARATION
    console.log('\n--- 10. ML Microservice Separation & Presets ---');
    await test('GET /api/clinical/presets returns presets via fallback when microservice offline', async () => {
      const res = await request('/api/clinical/presets');
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.presets));
      assert.ok(res.data.presets.length >= 2);
      assert.ok(res.data.presets[0].features);
    });

    await test('GET /api/models returns model metadata and separate FastAPI microservice URL', async () => {
      const res = await request('/api/models');
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.clinical_models);
      assert.ok(res.data.clinical_models.inference_service_url.includes('8000'));
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

runTests().catch((err) => {
  console.error('[FATAL TEST ERROR]', err);
  process.exit(1);
});
