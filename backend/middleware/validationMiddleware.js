const { body, validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed',
      errors: errors.array() 
    });
  }
  next();
};

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'judge', 'participant']).withMessage('Invalid role'),
  validateRequest
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest
];

const hackathonValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('assignmentStartDate').isISO8601().withMessage('Valid assignment start date is required'),
  body('assignmentEndDate').isISO8601().withMessage('Valid assignment end date is required'),
  body('submissionDeadline').isISO8601().withMessage('Valid submission deadline is required'),
  validateRequest
];

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty'),
  body('points').optional().isInt({ min: 0 }).withMessage('Points must be a positive integer'),
  validateRequest
];

const submissionValidation = [
  body('submissionUrl').trim().isURL().withMessage('Valid submission URL is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  validateRequest
];

module.exports = {
  registerValidation,
  loginValidation,
  hackathonValidation,
  taskValidation,
  submissionValidation,
  validateRequest
};