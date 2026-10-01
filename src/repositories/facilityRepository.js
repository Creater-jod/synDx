const { get, all } = require('../config/database');

class FacilityRepository {
  async findAll() {
    return await all('SELECT * FROM facilities ORDER BY distance_km ASC');
  }

  async findById(id) {
    return await get('SELECT * FROM facilities WHERE id = ?', [id]);
  }
}

module.exports = new FacilityRepository();
