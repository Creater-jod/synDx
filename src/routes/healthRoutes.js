const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

router.get('/health', (req, res) => healthController.getHealth(req, res));

module.exports = router;
