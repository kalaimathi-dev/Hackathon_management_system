const Submission = require('../models/Submission');
const TaskAssignment = require('../models/TaskAssignment');
const AuditLog = require('../models/AuditLog');
const { sendSubmissionConfirmationEmail } = require('../utils/emailService');
const { getClientIp } = require('../utils/helpers');

const createSubmission = async (req, res) => {
  try {
    const { assignmentId, submissionUrl, description, files } = req.body;

    const assignment = await TaskAssignment.findById(assignmentId)
      .populate('hackathonId')
      .populate('taskId');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    if (assignment.participantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to submit for this assignment'
      });
    }

    const hackathon = assignment.hackathonId;

    if (!hackathon.canSubmit()) {
      return res.status(400).json({
        success: false,
        message: 'Submission deadline has passed or hackathon is not active'
      });
    }

    const isLate = new Date() > new Date(hackathon.submissionDeadline);

    const submission = new Submission({
      assignmentId,
      participantId: req.user._id,
      taskId: assignment.taskId._id,
      hackathonId: hackathon._id,
      submissionUrl,
      description,
      files: files || [],
      isLate,
      isLatest: true
    });

    await submission.save();

    assignment.status = isLate ? 'late' : 'submitted';
    assignment.submissionId = submission._id;
    await assignment.save();

    await AuditLog.create({
      action: 'submission_created',
      performedBy: req.user._id,
      hackathonId: hackathon._id,
      taskId: assignment.taskId._id,
      assignmentId: assignment._id,
      details: { submissionId: submission._id, isLate },
      ipAddress: getClientIp(req)
    });

    await sendSubmissionConfirmationEmail(
      req.user,
      assignment.taskId,
      hackathon,
      submission
    );

    res.status(201).json({
      success: true,
      message: 'Submission created successfully',
      data: { submission }
    });
  } catch (error) {
    console.error('Create submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create submission'
    });
  }
};

const getSubmissionsByAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const submissions = await Submission.find({ assignmentId })
      .populate('participantId', 'name email')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      data: { submissions }
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions'
    });
  }
};

const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ 
      participantId: req.user._id 
    })
      .populate('taskId')
      .populate('hackathonId')
      .populate('assignmentId')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      data: { submissions }
    });
  } catch (error) {
    console.error('Get my submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions'
    });
  }
};

const getSubmissionsByHackathon = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    const submissions = await Submission.find({ 
      hackathonId,
      isLatest: true 
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
    console.error('Get hackathon submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions'
    });
  }
};

const updateSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { submissionUrl, description, files } = req.body;

    const submission = await Submission.findById(id)
      .populate('assignmentId');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    if (submission.participantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this submission'
      });
    }

    if (submission.evaluation && submission.evaluation.score !== undefined) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update an evaluated submission'
      });
    }

    if (submissionUrl) submission.submissionUrl = submissionUrl;
    if (description) submission.description = description;
    if (files) submission.files = files;

    await submission.save();

    res.json({
      success: true,
      message: 'Submission updated successfully',
      data: { submission }
    });
  } catch (error) {
    console.error('Update submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update submission'
    });
  }
};

module.exports = {
  createSubmission,
  getSubmissionsByAssignment,
  getMySubmissions,
  getSubmissionsByHackathon,
  updateSubmission
};