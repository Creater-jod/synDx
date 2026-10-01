const syncService = require('../services/syncService');

class SyncController {
  async sync(req, res, next) {
    try {
      const { items } = req.body;
      const result = await syncService.processSync(items);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SyncController();
