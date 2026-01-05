const express = require('express');
const router = express.Router();
const judgeController = require('../controllers/judgeController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/evaluate/:submissionId', 
  authenticate, 
  authorize('judge', 'admin'), 
  judgeController.evaluateSubmission
);

router.get('/pending/:hackathonId', 
  authenticate, 
  authorize('judge', 'admin'), 
  judgeController.getSubmissionsForEvaluation
);

router.get('/evaluated/:hackathonId', 
  authenticate, 
  authorize('judge', 'admin'), 
  judgeController.getEvaluatedSubmissions
);

router.get('/leaderboard/:hackathonId', 
  authenticate, 
  judgeController.getLeaderboard
);

module.exports = router;