const { get, all, run } = require('../config/database');

class CaseRepository {
  formatCase(r) {
    if (!r) return null;
    let features = [];
    let vitals = {};
    let referral = {};
    let audit = {};

    try { features = JSON.parse(r.features_json || '[]'); } catch (e) {}
    try { vitals = JSON.parse(r.vitals_json || '{}'); } catch (e) {}
    try { referral = JSON.parse(r.referral_json || '{}'); } catch (e) {}
    try { audit = JSON.parse(r.audit_json || '{}'); } catch (e) {}

    return {
      id: r.id,
      condition: r.condition,
      tier: r.tier,
      confidence: r.confidence,
      emergency: Boolean(r.emergency),
      day: r.day,
      time: r.time,
      status: r.status,
      note: r.note || '',
      features,
      vitals,
      referral,
      audit
    };
  }

  async findAll() {
    const rows = await all('SELECT * FROM cases ORDER BY created_at DESC');
    return rows.map(r => this.formatCase(r));
  }

  async findById(id) {
    const row = await get('SELECT * FROM cases WHERE id = ?', [id]);
    return this.formatCase(row);
  }

  async create({
    id,
    condition,
    tier,
    confidence,
    emergency,
    day,
    time,
    status,
    note,
    features_json,
    vitals_json,
    referral_json,
    audit_json
  }) {
    return await run(
      `INSERT INTO cases (id, condition, tier, confidence, emergency, day, time, status, note, features_json, vitals_json, referral_json, audit_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        condition,
        tier,
        confidence,
        emergency ? 1 : 0,
        day,
        time,
        status,
        note,
        features_json,
        vitals_json,
        referral_json,
        audit_json
      ]
    );
  }

  async insertOrReplace({
    id,
    condition,
    tier,
    confidence,
    emergency,
    day,
    time,
    status,
    note,
    features_json,
    vitals_json,
    referral_json,
    audit_json
  }) {
    return await run(
      `INSERT OR REPLACE INTO cases (id, condition, tier, confidence, emergency, day, time, status, note, features_json, vitals_json, referral_json, audit_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        condition,
        tier,
        confidence,
        emergency ? 1 : 0,
        day,
        time,
        status,
        note,
        features_json,
        vitals_json,
        referral_json,
        audit_json
      ]
    );
  }

  async insertOrReplaceIntake({
    id,
    condition,
    tier,
    confidence,
    emergency,
    day,
    time,
    status,
    note,
    features_json,
    vitals_json
  }) {
    return await run(
      `INSERT OR REPLACE INTO cases (id, condition, tier, confidence, emergency, day, time, status, note, features_json, vitals_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        condition,
        tier,
        confidence,
        emergency ? 1 : 0,
        day,
        time,
        status,
        note,
        features_json,
        vitals_json
      ]
    );
  }

  async updateDecision(id, status, note) {
    return await run(
      'UPDATE cases SET status = ?, note = ? WHERE id = ?',
      [status, note || '', id]
    );
  }
}

module.exports = new CaseRepository();
