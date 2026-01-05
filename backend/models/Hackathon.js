const mongoose = require('mongoose');

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

hackathonSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

hackathonSchema.methods.isActive = function() {
  return this.status === 'active';
};

hackathonSchema.methods.canAssignTasks = function() {
  const now = new Date();
  return this.status === 'active' && 
         now >= this.assignmentStartDate && 
         now <= this.assignmentEndDate;
};

hackathonSchema.methods.canSubmit = function() {
  const now = new Date();
  return this.status === 'active' && now <= this.submissionDeadline;
};

module.exports = mongoose.model('Hackathon', hackathonSchema);