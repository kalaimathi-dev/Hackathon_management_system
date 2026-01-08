const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      // Task Management
      'task_assigned',
      'task_reassigned',
      'task_unassigned',
      'task_created',
      'task_updated',
      'task_deleted',
      
      // Submission Management
      'submission_created',
      'submission_updated',
      'submission_evaluated',
      
      // User Management
      'user_registered',
      'user_login',
      'user_logout',
      'email_verified',
      
      // Hackathon Management
      'hackathon_created',
      'hackathon_updated',
      'hackathon_deleted',
      'registration_code_regenerated',
      
      // Participant Actions
      'participant_enrolled',
      'participant_registered_via_link',
      'new_user_registered_via_link',
      
      // Evaluation
      'evaluation_updated'
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
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission'
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

// Indexes for performance
auditLogSchema.index({ performedBy: 1, timestamp: -1 });
auditLogSchema.index({ hackathonId: 1, action: 1 });
auditLogSchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);