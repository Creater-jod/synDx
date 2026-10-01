const referralService = require('../services/referralService');

class ReferralController {
  async getFacilities(req, res, next) {
    try {
      const facilities = await referralService.getFacilities();
      res.json(facilities);
    } catch (err) {
      next(err);
    }
  }

  async matchReferrals(req, res, next) {
    try {
      const { condition, is_emergency } = req.body;
      const result = await referralService.matchFacilities(condition, is_emergency);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  getSpecialists(req, res, next) {
    try {
      const specialists = referralService.getSpecialists();
      res.json(specialists);
    } catch (err) {
      next(err);
    }
  }

  estimateCost(req, res, next) {
    try {
      const { condition, insurance_pct } = req.query;
      const cost = referralService.estimateCost(condition, insurance_pct);
      res.json(cost);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReferralController();
