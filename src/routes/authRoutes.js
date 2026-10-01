const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { validateLogin, validateRegister } = require('../validation/authValidation');

router.post('/login', validate(validateLogin), (req, res, next) => authController.login(req, res, next));
router.post('/register', validate(validateRegister), (req, res, next) => authController.register(req, res, next));
router.get('/me', authenticateToken, (req, res, next) => authController.getMe(req, res, next));

module.exports = router;
