const { get, run } = require('../config/database');

class MutationRepository {
  async findByMutationId(mutationId) {
    if (!mutationId) return null;
    return await get('SELECT * FROM processed_mutations WHERE mutation_id = ?', [mutationId]);
  }

  async recordMutation({ mutation_id, case_id, type, status, response_json }) {
    return await run(
      `INSERT OR REPLACE INTO processed_mutations (mutation_id, case_id, type, status, response_json)
       VALUES (?, ?, ?, ?, ?)`,
      [mutation_id, case_id, type, status || 'SYNCED', response_json || '{}']
    );
  }
}

module.exports = new MutationRepository();
