const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { submissionValidation } = require('../middleware/validationMiddleware');

router.post('/', 
  authenticate, 
  authorize('participant'), 
  submissionValidation, 
  submissionController.createSubmission
);

router.get('/assignment/:assignmentId', 
  authenticate, 
  submissionController.getSubmissionsByAssignment
);

router.get('/my-submissions', 
  authenticate, 
  authorize('participant'), 
  submissionController.getMySubmissions
);

router.get('/hackathon/:hackathonId', 
  authenticate, 
  authorize('admin', 'judge'), 
  submissionController.getSubmissionsByHackathon
);

router.put('/:id', 
  authenticate, 
  authorize('participant'), 
  submissionController.updateSubmission
);

module.exports = router;