const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'task_assigned',
      'task_reassigned',
      'task_unassigned',
      'submission_created',
      'submission_evaluated',
      'user_registered',
      'user_login',
      'hackathon_created',
      'hackathon_updated'
    ]
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  hackathonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon'
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TaskAssignment'
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

auditLogSchema.index({ performedBy: 1, timestamp: -1 });
auditLogSchema.index({ hackathonId: 1, action: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);