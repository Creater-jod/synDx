const auditService = require('../services/auditService');

class AuditController {
  async getAuditLog(req, res, next) {
    try {
      const logs = await auditService.getAuditLog();
      res.json(logs);
    } catch (err) {
      next(err);
    }
  }

  async verifyBlockchain(req, res, next) {
    try {
      const result = await auditService.verifyBlockchainLedger();
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuditController();
