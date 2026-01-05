const mongoose = require('mongoose');

const taskAssignmentSchema = new mongoose.Schema({
  hackathonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon',
    required: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  participantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignmentMethod: {
    type: String,
    enum: ['random', 'manual', 'smart'],
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['assigned', 'submitted', 'evaluated', 'late'],
    default: 'assigned'
  },
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission'
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  remarks: String
});

taskAssignmentSchema.index({ hackathonId: 1, participantId: 1 });
taskAssignmentSchema.index({ hackathonId: 1, taskId: 1, participantId: 1 }, { unique: true });

module.exports = mongoose.model('TaskAssignment', taskAssignmentSchema);