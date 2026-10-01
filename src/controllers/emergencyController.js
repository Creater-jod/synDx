const emergencyService = require('../services/emergencyService');

class EmergencyController {
  evaluateVitals(req, res, next) {
    try {
      const evaluation = emergencyService.evaluateVitals(req.body);
      res.json(evaluation);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new EmergencyController();
