const { get, all, run } = require('../config/database');

class AuditRepository {
  async create({
    case_id,
    event_type,
    case_hash,
    diagnosis_hash,
    model_version,
    tx_hash,
    block_number,
    status
  }) {
    return await run(
      `INSERT INTO audit_trail (case_id, event_type, case_hash, diagnosis_hash, model_version, tx_hash, block_number, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        case_id,
        event_type,
        case_hash,
        diagnosis_hash,
        model_version || 'synDx-edge-nb-v1.0',
        tx_hash,
        block_number,
        status || 'CONFIRMED'
      ]
    );
  }

  async findAllDesc() {
    return await all('SELECT * FROM audit_trail ORDER BY timestamp DESC');
  }

  async findAllAsc() {
    return await all('SELECT * FROM audit_trail ORDER BY id ASC');
  }
}

module.exports = new AuditRepository();
