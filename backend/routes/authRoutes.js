const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { loginLimiter } = require('../middleware/rateLimitMiddleware');
const { registerValidation, loginValidation } = require('../middleware/validationMiddleware');

router.post('/register', registerValidation, authController.register);
router.get('/verify-email', authController.verifyEmail);
router.post('/login', loginLimiter, loginValidation, authController.login);
router.post('/refresh-token', authController.refreshAccessToken);
router.post('/logout', authController.logout);
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;