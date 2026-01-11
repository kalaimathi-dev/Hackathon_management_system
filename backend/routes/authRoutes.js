const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { loginLimiter } = require('../middleware/rateLimitMiddleware');
const { registerValidation, loginValidation } = require('../middleware/validationMiddleware');
const User = require('../models/User');

// TEMPORARY: Debug endpoint to check if users exist
router.get('/debug/users', async (req, res) => {
  try {
    const users = await User.find({}, 'email isEmailVerified role createdAt').limit(10);
    res.json({ 
      success: true, 
      count: users.length,
      users: users.map(u => ({
        email: u.email,
        verified: u.isEmailVerified,
        role: u.role
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/register', registerValidation, authController.register);
router.get('/verify-email', authController.verifyEmail);
router.post('/login', loginLimiter, loginValidation, authController.login);
router.post('/refresh-token', authController.refreshAccessToken);
router.post('/logout', authController.logout);
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;