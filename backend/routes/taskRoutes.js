const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { taskValidation } = require('../middleware/validationMiddleware');

router.post('/', 
  authenticate, 
  authorize('admin'), 
  taskValidation, 
  taskController.createTask
);

router.get('/hackathon/:hackathonId', authenticate, taskController.getTasksByHackathon);
router.get('/:id', authenticate, taskController.getTaskById);

router.put('/:id', 
  authenticate, 
  authorize('admin'), 
  taskController.updateTask
);

router.delete('/:id', 
  authenticate, 
  authorize('admin'), 
  taskController.deleteTask
);

module.exports = router;