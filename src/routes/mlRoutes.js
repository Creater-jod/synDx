const express = require('express');
const router = express.Router();
const mlController = require('../controllers/mlController');

router.get('/datasets', (req, res, next) => mlController.getDatasets(req, res, next));
router.get('/models', (req, res, next) => mlController.getModels(req, res, next));
router.get('/federated/status', (req, res, next) => mlController.getFederatedStatus(req, res, next));
router.get('/clinical/presets', (req, res, next) => mlController.getClinicalPresets(req, res, next));
router.post('/predict/clinical', (req, res, next) => mlController.predictClinical(req, res, next));

module.exports = router;
