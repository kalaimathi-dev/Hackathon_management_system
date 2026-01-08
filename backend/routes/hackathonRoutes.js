const express = require('express');
const router = express.Router();
const hackathonController = require('../controllers/hackathonController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { hackathonValidation } = require('../middleware/validationMiddleware');

// ========================================
// PUBLIC ROUTES - MUST BE FIRST
// These routes do NOT require authentication
// ========================================
router.get('/public/code/:code', hackathonController.getHackathonByCode);
router.post('/public/register/:code', hackathonController.registerViaLink);

// ========================================
// ADMIN ROUTES - Require authentication and admin role
// ========================================
router.post('/', 
  authenticate, 
  authorize('admin'), 
  hackathonValidation, 
  hackathonController.createHackathon
);

router.put('/:id', 
  authenticate, 
  authorize('admin'), 
  hackathonController.updateHackathon
);

router.delete('/:id', 
  authenticate, 
  authorize('admin'), 
  hackathonController.deleteHackathon
);

router.post('/:id/regenerate-code',
  authenticate,
  authorize('admin'),
  hackathonController.regenerateRegistrationCode
);

// ========================================
// AUTHENTICATED USER ROUTES
// These must come AFTER specific routes like /public/*
// ========================================
router.get('/', authenticate, hackathonController.getAllHackathons);

// IMPORTANT: This /:id route must come LAST to avoid catching other routes
router.get('/:id', authenticate, hackathonController.getHackathonById);

router.post('/:id/enroll', 
  authenticate, 
  authorize('participant'), 
  hackathonController.enrollParticipant
);

module.exports = router;