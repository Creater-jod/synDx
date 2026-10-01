const crypto = require('crypto');
const caseRepository = require('../repositories/caseRepository');
const auditRepository = require('../repositories/auditRepository');
const mutationRepository = require('../repositories/mutationRepository');
const { calculateCaseHash, calculateDiagnosisHash, SCHEMA_VERSION } = require('../models/caseSchema');

class SyncService {
  async processSync(items) {
    let processedCount = 0;
    const syncedIds = [];
    const mutationResults = [];

    for (const item of items) {
      const mutationId = item.mutation_id || item.client_mutation_id || (item.payload && (item.payload.mutation_id || item.payload.client_mutation_id)) || null;

      // 1. Idempotency Check: Has this mutation already been processed?
      if (mutationId) {
        const existing = await mutationRepository.findByMutationId(mutationId);
        if (existing) {
          const caseId = existing.case_id || (item.payload && item.payload.id);
          if (caseId && !syncedIds.includes(caseId)) {
            syncedIds.push(caseId);
          }
          mutationResults.push({
            mutation_id: mutationId,
            status: 'ALREADY_SYNCED',
            case_id: caseId
          });
          continue; // Idempotently skip reprocessing
        }
      }

      // 2. Process New Mutation
      if (item.type === 'CASE_CREATED' && item.payload) {
        const p = item.payload;
        const caseId = p.id || `CASE-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

        // De-identified privacy-preserving hashes
        const case_hash = calculateCaseHash({ id: caseId, ...p });
        const diag_hash = calculateDiagnosisHash({ condition: p.condition, confidence: p.confidence, tier: p.tier });
        const audit = JSON.stringify({
          schema_version: p.schema_version || SCHEMA_VERSION,
          case_hash,
          diagnosis_hash: diag_hash,
          model: p.model || 'synDx-edge-nb-v1.0'
        });

        await caseRepository.insertOrReplace({
          id: caseId,
          condition: p.condition || 'Suspected Phenotype',
          tier: p.tier || 'B',
          confidence: p.confidence !== undefined ? p.confidence : 80,
          emergency: p.emergency ? 1 : 0,
          day: p.day || 'today',
          time: p.time || 'Just now',
          status: p.status || 'pending',
          note: p.note || '',
          features_json: JSON.stringify(p.features || []),
          vitals_json: JSON.stringify(p.vitals || {}),
          referral_json: JSON.stringify(p.referral || {}),
          audit_json: audit
        });

        // Insert de-identified audit trail record
        const tx_hash = '0x' + crypto.randomBytes(16).toString('hex');
        await auditRepository.create({
          case_id: caseId,
          event_type: 'OFFLINE_SYNC_INTAKE',
          case_hash,
          diagnosis_hash: diag_hash,
          model_version: 'synDx-edge-nb-v1.0',
          tx_hash,
          block_number: 1849220 + Math.floor(Math.random() * 100),
          status: 'CONFIRMED'
        });

        // Record mutation as processed for idempotency
        if (mutationId) {
          await mutationRepository.recordMutation({
            mutation_id: mutationId,
            case_id: caseId,
            type: item.type,
            status: 'SYNCED',
            response_json: JSON.stringify({ id: caseId, status: 'synced' })
          });
        }

        if (!syncedIds.includes(caseId)) syncedIds.push(caseId);
        mutationResults.push({
          mutation_id: mutationId,
          status: 'SYNCED',
          case_id: caseId
        });
        processedCount++;

      } else if (item.type === 'DECISION_MADE' && item.payload) {
        const p = item.payload;
        await caseRepository.updateDecision(p.id, p.status, p.note || '');

        const case_hash = calculateCaseHash({ id: p.id });
        const diag_hash = crypto.createHash('sha256').update(p.status + (p.note ? p.note.length : '')).digest('hex').substring(0, 16);
        const tx_hash = '0x' + crypto.randomBytes(16).toString('hex');

        await auditRepository.create({
          case_id: p.id,
          event_type: 'OFFLINE_SYNC_DECISION',
          case_hash,
          diagnosis_hash: diag_hash,
          model_version: 'synDx-edge-nb-v1.0',
          tx_hash,
          block_number: 1849220 + Math.floor(Math.random() * 100),
          status: 'CONFIRMED'
        });

        if (mutationId) {
          await mutationRepository.recordMutation({
            mutation_id: mutationId,
            case_id: p.id,
            type: item.type,
            status: 'SYNCED',
            response_json: JSON.stringify({ id: p.id, decision: p.status })
          });
        }

        if (!syncedIds.includes(p.id)) syncedIds.push(p.id);
        mutationResults.push({
          mutation_id: mutationId,
          status: 'SYNCED',
          case_id: p.id
        });
        processedCount++;
      }
    }

    return {
      status: 'success',
      processed: processedCount,
      synced_ids: syncedIds,
      mutations: mutationResults,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new SyncService();
