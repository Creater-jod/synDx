const caseService = require('../services/caseService');

class CaseController {
  async getAllCases(req, res, next) {
    try {
      const cases = await caseService.getAllCases();
      res.json(cases);
    } catch (err) {
      next(err);
    }
  }

  async getCaseById(req, res, next) {
    try {
      const { id } = req.params;
      const singleCase = await caseService.getCaseById(id);
      res.json(singleCase);
    } catch (err) {
      next(err);
    }
  }

  async createCase(req, res, next) {
    try {
      const result = await caseService.createCase(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async recordDecision(req, res, next) {
    try {
      const { id } = req.params;
      const { status, note } = req.body;
      const result = await caseService.recordDecision(id, status, note);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async patientIntake(req, res, next) {
    try {
      const result = await caseService.patientIntake(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CaseController();
