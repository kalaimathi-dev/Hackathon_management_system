const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/assign/manual', 
  authenticate, 
  authorize('admin'), 
  assignmentController.manualAssignment
);

router.post('/assign/random', 
  authenticate, 
  authorize('admin'), 
  assignmentController.randomAssignmentHandler
);

router.post('/assign/smart', 
  authenticate, 
  authorize('admin'), 
  assignmentController.smartAssignmentHandler
);

router.get('/hackathon/:hackathonId', 
  authenticate, 
  authorize('admin', 'judge'), 
  assignmentController.getAssignmentsByHackathon
);

router.get('/my-assignments', 
  authenticate, 
  authorize('participant'), 
  assignmentController.getMyAssignments
);

router.put('/:assignmentId/reassign', 
  authenticate, 
  authorize('admin'), 
  assignmentController.reassignTask
);

router.delete('/:assignmentId', 
  authenticate, 
  authorize('admin'), 
  assignmentController.unassignTask
);

module.exports = router;