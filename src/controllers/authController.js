const authService = require('../services/authService');

class AuthController {
  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      const result = await authService.login(username, password);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      res.json({ user: req.user });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
