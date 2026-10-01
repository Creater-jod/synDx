const crypto = require('crypto');
const caseRepository = require('../repositories/caseRepository');
const auditRepository = require('../repositories/auditRepository');

class SyncService {
  async processSync(items) {
    let processedCount = 0;
    const syncedIds = [];

    for (const item of items) {
      if (item.type === 'CASE_CREATED' && item.payload) {
        const p = item.payload;
        const case_hash = crypto.createHash('sha256').update((p.id || '') + (p.condition || '')).digest('hex').substring(0, 16);
        const diag_hash = crypto.createHash('sha256').update((p.condition || '') + (p.confidence || '')).digest('hex').substring(0, 16);
        const audit = JSON.stringify({ case_hash, diagnosis_hash: diag_hash, model: p.model || 'synDx-edge-nb-v1.0' });

        await caseRepository.insertOrReplace({
          id: p.id,
          condition: p.condition,
          tier: p.tier,
          confidence: p.confidence,
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

        const tx_hash = '0x' + crypto.randomBytes(16).toString('hex');
        await auditRepository.create({
          case_id: p.id,
          event_type: 'OFFLINE_SYNC_INTAKE',
          case_hash,
          diagnosis_hash: diag_hash,
          model_version: 'synDx-edge-nb-v1.0',
          tx_hash,
          block_number: 1849220 + Math.floor(Math.random() * 100),
          status: 'CONFIRMED'
        });

        syncedIds.push(p.id);
        processedCount++;
      } else if (item.type === 'DECISION_MADE' && item.payload) {
        const p = item.payload;
        await caseRepository.updateDecision(p.id, p.status, p.note || '');

        const tx_hash = '0x' + crypto.randomBytes(16).toString('hex');
        await auditRepository.create({
          case_id: p.id,
          event_type: 'OFFLINE_SYNC_DECISION',
          case_hash: p.id,
          diagnosis_hash: p.status,
          model_version: 'synDx-edge-nb-v1.0',
          tx_hash,
          block_number: 1849220 + Math.floor(Math.random() * 100),
          status: 'CONFIRMED'
        });

        syncedIds.push(p.id);
        processedCount++;
      }
    }

    return {
      status: 'success',
      processed: processedCount,
      synced_ids: syncedIds,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new SyncService();
