const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  hackathonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true
  }],
  points: {
    type: Number,
    default: 100
  },
  resources: [{
    title: String,
    url: String
  }],
  isAssigned: {
    type: Boolean,
    default: false
  },
  assignedCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

taskSchema.index({ hackathonId: 1, tags: 1 });
taskSchema.index({ hackathonId: 1, isAssigned: 1 });

module.exports = mongoose.model('Task', taskSchema);