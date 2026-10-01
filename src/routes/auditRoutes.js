const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');

router.get('/audit', (req, res, next) => auditController.getAuditLog(req, res, next));
router.get('/blockchain/verify', (req, res, next) => auditController.verifyBlockchain(req, res, next));

module.exports = router;
