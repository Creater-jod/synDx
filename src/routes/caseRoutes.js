const express = require('express');
const router = express.Router();
const caseController = require('../controllers/caseController');
const validate = require('../middleware/validate');
const { validateCreateCase, validateCaseDecision } = require('../validation/caseValidation');

router.get('/', (req, res, next) => caseController.getAllCases(req, res, next));
router.get('/:id', (req, res, next) => caseController.getCaseById(req, res, next));
router.post('/', validate(validateCreateCase), (req, res, next) => caseController.createCase(req, res, next));
router.post('/:id/decision', validate(validateCaseDecision), (req, res, next) => caseController.recordDecision(req, res, next));

module.exports = router;
