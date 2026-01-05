const Submission = require('../models/Submission');
const TaskAssignment = require('../models/TaskAssignment');
const AuditLog = require('../models/AuditLog');
const { sendEvaluationResultEmail } = require('../utils/emailService');
const { getClientIp } = require('../utils/helpers');

const evaluateSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { score, feedback } = req.body;

    if (score === undefined || score < 0 || score > 100) {
      return res.status(400).json({
        success: false,
        message: 'Score must be between 0 and 100'
      });
    }

    const submission = await Submission.findById(submissionId)
      .populate('participantId', 'name email')
      .populate('taskId', 'title points')
      .populate('hackathonId', 'title');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    if (!submission.isLatest) {
      return res.status(400).json({
        success: false,
        message: 'Can only evaluate the latest submission'
      });
    }

    submission.evaluation = {
      score,
      feedback: feedback || '',
      evaluatedBy: req.user._id,
      evaluatedAt: new Date()
    };

    await submission.save();

    const assignment = await TaskAssignment.findById(submission.assignmentId);
    if (assignment) {
      assignment.status = 'evaluated';
      assignment.score = score;
      assignment.remarks = feedback;
      await assignment.save();
    }

    await AuditLog.create({
      action: 'submission_evaluated',
      performedBy: req.user._id,
      targetUser: submission.participantId._id,
      hackathonId: submission.hackathonId._id,
      taskId: submission.taskId._id,
      assignmentId: submission.assignmentId,
      details: { submissionId: submission._id, score },
      ipAddress: getClientIp(req)
    });

    await sendEvaluationResultEmail(
      submission.participantId,
      submission.taskId,
      submission.hackathonId,
      submission.evaluation
    );

    res.json({
      success: true,
      message: 'Submission evaluated successfully',
      data: { submission }
    });
  } catch (error) {
    console.error('Evaluate submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to evaluate submission'
    });
  }
};

const getSubmissionsForEvaluation = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    const submissions = await Submission.find({
      hackathonId,
      isLatest: true,
      'evaluation.score': { $exists: false }
    })
      .populate('participantId', 'name email')
      .populate('taskId', 'title difficulty points')
      .populate('assignmentId')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      data: { submissions }
    });
  } catch (error) {
    console.error('Get submissions for evaluation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions'
    });
  }
};

const getEvaluatedSubmissions = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    const submissions = await Submission.find({
      hackathonId,
      isLatest: true,
      'evaluation.score': { $exists: true }
    })
      .populate('participantId', 'name email')
      .populate('taskId', 'title difficulty points')
      .populate('evaluation.evaluatedBy', 'name email')
      .sort({ 'evaluation.evaluatedAt': -1 });

    res.json({
      success: true,
      data: { submissions }
    });
  } catch (error) {
    console.error('Get evaluated submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions'
    });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const mongoose = require('mongoose');

    const leaderboard = await Submission.aggregate([
      {
        $match: {
          hackathonId: new mongoose.Types.ObjectId(hackathonId),
          isLatest: true,
          'evaluation.score': { $exists: true }
        }
      },
      {
        $group: {
          _id: '$participantId',
          totalScore: { $sum: '$evaluation.score' },
          submissionCount: { $sum: 1 },
          averageScore: { $avg: '$evaluation.score' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'participant'
        }
      },
      {
        $unwind: '$participant'
      },
      {
        $project: {
          participantId: '$_id',
          participantName: '$participant.name',
          participantEmail: '$participant.email',
          totalScore: 1,
          submissionCount: 1,
          averageScore: { $round: ['$averageScore', 2] }
        }
      },
      {
        $sort: { totalScore: -1, averageScore: -1 }
      }
    ]);

    res.json({
      success: true,
      data: { leaderboard }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard'
    });
  }
};

module.exports = {
  evaluateSubmission,
  getSubmissionsForEvaluation,
  getEvaluatedSubmissions,
  getLeaderboard
};