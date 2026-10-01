const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const { JWT_SECRET } = require('../config/env');

class AuthService {
  async login(username, password) {
    const user = await userRepository.findByUsername(username);
    if (!user) {
      const err = new Error('Invalid username or password.');
      err.status = 401;
      throw err;
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password_hash);
    if (!passwordIsValid) {
      const err = new Error('Invalid username or password.');
      err.status = 401;
      throw err;
    }

    const tokenPayload = {
      id: user.id,
      username: user.username,
      role: user.role,
      full_name: user.full_name,
      specialty: user.specialty
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

    return {
      message: 'Authentication successful',
      token,
      user: tokenPayload
    };
  }

  async register({ username, password, full_name, role, specialty }) {
    const existing = await userRepository.findByUsername(username);
    if (existing) {
      const err = new Error('Username already exists.');
      err.status = 400;
      throw err;
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const result = await userRepository.create({
      username,
      password_hash: passwordHash,
      full_name,
      role,
      specialty: specialty || 'General Medicine'
    });

    return {
      message: 'User registered successfully',
      userId: result.lastID
    };
  }

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const err = new Error('User not found.');
      err.status = 404;
      throw err;
    }
    return user;
  }
}

module.exports = new AuthService();
