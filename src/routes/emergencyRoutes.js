const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const validate = require('../middleware/validate');
const { validateEmergencyEvaluation } = require('../validation/emergencyValidation');

router.post('/evaluate', validate(validateEmergencyEvaluation), (req, res, next) => emergencyController.evaluateVitals(req, res, next));

module.exports = router;
