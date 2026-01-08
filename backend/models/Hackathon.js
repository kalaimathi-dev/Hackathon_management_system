const mongoose = require('mongoose');
const crypto = require('crypto');

const hackathonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  assignmentStartDate: {
    type: Date,
    required: true
  },
  assignmentEndDate: {
    type: Date,
    required: true
  },
  submissionDeadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  maxParticipants: {
    type: Number,
    default: 100
  },
  tasksPerParticipant: {
    type: Number,
    default: 1
  },
  allowPublicRegistration: {
    type: Boolean,
    default: true
  },
  registrationCode: {
    type: String,
    unique: true,
    sparse: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  judges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to generate registration code
hackathonSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Generate registration code if not exists
  if (!this.registrationCode) {
    this.registrationCode = crypto.randomBytes(8).toString('hex');
  }
  
  next();
});

// Check if hackathon is active
hackathonSchema.methods.isActive = function() {
  return this.status === 'active';
};

// Check if tasks can be assigned
hackathonSchema.methods.canAssignTasks = function() {
  const now = new Date();
  return this.status === 'active' && 
         now >= this.assignmentStartDate && 
         now <= this.assignmentEndDate;
};

// Check if submissions are allowed
hackathonSchema.methods.canSubmit = function() {
  const now = new Date();
  return this.status === 'active' && now <= this.submissionDeadline;
};

// Check if registration is open
hackathonSchema.methods.isRegistrationOpen = function() {
  if (!this.allowPublicRegistration) {
    return false;
  }
  
  if (this.status !== 'active' && this.status !== 'draft') {
    return false;
  }
  
  const now = new Date();
  if (now > this.startDate) {
    return false;
  }
  
  if (this.participants.length >= this.maxParticipants) {
    return false;
  }
  
  return true;
};

// Get registration URL
hackathonSchema.methods.getRegistrationUrl = function() {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${baseUrl}/register/${this.registrationCode}`;
};

module.exports = mongoose.model('Hackathon', hackathonSchema);