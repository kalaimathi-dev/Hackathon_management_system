const express = require('express');
const router = express.Router();
const hackathonController = require('../controllers/hackathonController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { hackathonValidation } = require('../middleware/validationMiddleware');

router.post('/', 
  authenticate, 
  authorize('admin'), 
  hackathonValidation, 
  hackathonController.createHackathon
);

router.get('/', authenticate, hackathonController.getAllHackathons);
router.get('/:id', authenticate, hackathonController.getHackathonById);

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

router.post('/:id/enroll', 
  authenticate, 
  authorize('participant'), 
  hackathonController.enrollParticipant
);

module.exports = router;