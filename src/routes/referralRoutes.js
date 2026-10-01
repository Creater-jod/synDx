const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');
const validate = require('../middleware/validate');
const { validateReferralMatch } = require('../validation/referralValidation');

router.get('/facilities', (req, res, next) => referralController.getFacilities(req, res, next));
router.post('/referrals/match', validate(validateReferralMatch), (req, res, next) => referralController.matchReferrals(req, res, next));
router.get('/specialists', (req, res, next) => referralController.getSpecialists(req, res, next));
router.get('/cost/estimate', (req, res, next) => referralController.estimateCost(req, res, next));

module.exports = router;
