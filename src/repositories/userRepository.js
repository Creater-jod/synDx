const { get, all, run } = require('../config/database');

class UserRepository {
  async findByUsername(username) {
    return await get('SELECT * FROM users WHERE username = ?', [username]);
  }

  async findById(id) {
    return await get(
      'SELECT id, username, full_name, role, specialty, created_at FROM users WHERE id = ?',
      [id]
    );
  }

  async create({ username, password_hash, full_name, role, specialty }) {
    return await run(
      'INSERT INTO users (username, password_hash, full_name, role, specialty) VALUES (?, ?, ?, ?, ?)',
      [username, password_hash, full_name, role, specialty || 'General Medicine']
    );
  }

  async count() {
    const row = await get('SELECT COUNT(*) as count FROM users');
    return row ? row.count : 0;
  }
}

module.exports = new UserRepository();
