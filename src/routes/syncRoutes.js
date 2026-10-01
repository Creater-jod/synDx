const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');
const validate = require('../middleware/validate');
const { validateSync } = require('../validation/syncValidation');

router.post('/', validate(validateSync), (req, res, next) => syncController.sync(req, res, next));

module.exports = router;
