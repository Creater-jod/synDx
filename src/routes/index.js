const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const caseRoutes = require('./caseRoutes');
const emergencyRoutes = require('./emergencyRoutes');
const referralRoutes = require('./referralRoutes');
const syncRoutes = require('./syncRoutes');
const auditRoutes = require('./auditRoutes');
const mlRoutes = require('./mlRoutes');
const healthRoutes = require('./healthRoutes');

const caseController = require('../controllers/caseController');
const validate = require('../middleware/validate');
const { validatePatientIntake } = require('../validation/caseValidation');

// Mount sub-routers preserving exact endpoint paths
router.use('/auth', authRoutes);
router.use('/cases', caseRoutes);
router.use('/emergency', emergencyRoutes);
router.use('/sync', syncRoutes);

// Referral routes
router.use('/', referralRoutes);

// Audit and verification routes
router.use('/', auditRoutes);

// ML and microservice routes
router.use('/', mlRoutes);

// Health check
router.use('/', healthRoutes);

// Multimodal patient intake endpoint
router.post('/patient/intake', validate(validatePatientIntake), (req, res, next) => {
  caseController.patientIntake(req, res, next);
});

module.exports = router;
