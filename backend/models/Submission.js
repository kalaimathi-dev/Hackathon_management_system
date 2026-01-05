const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TaskAssignment',
    required: true
  },
  participantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  hackathonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon',
    required: true
  },
  submissionUrl: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  files: [{
    filename: String,
    url: String,
    size: Number
  }],
  isLatest: {
    type: Boolean,
    default: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  isLate: {
    type: Boolean,
    default: false
  },
  evaluation: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    feedback: String,
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    evaluatedAt: Date
  }
});

submissionSchema.index({ assignmentId: 1, isLatest: 1 });
submissionSchema.index({ participantId: 1, hackathonId: 1 });

submissionSchema.pre('save', async function(next) {
  if (this.isNew && this.isLatest) {
    await mongoose.model('Submission').updateMany(
      { 
        assignmentId: this.assignmentId,
        _id: { $ne: this._id }
      },
      { $set: { isLatest: false } }
    );
  }
  next();
});

module.exports = mongoose.model('Submission', submissionSchema);