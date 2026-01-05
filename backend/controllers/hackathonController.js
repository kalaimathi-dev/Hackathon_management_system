const Hackathon = require('../models/Hackathon');
const AuditLog = require('../models/AuditLog');
const { getClientIp } = require('../utils/helpers');

const createHackathon = async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      assignmentStartDate,
      assignmentEndDate,
      submissionDeadline,
      maxParticipants,
      tasksPerParticipant
    } = req.body;

    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    if (new Date(assignmentEndDate) <= new Date(assignmentStartDate)) {
      return res.status(400).json({
        success: false,
        message: 'Assignment end date must be after assignment start date'
      });
    }

    if (new Date(submissionDeadline) <= new Date(assignmentEndDate)) {
      return res.status(400).json({
        success: false,
        message: 'Submission deadline must be after assignment end date'
      });
    }

    const hackathon = new Hackathon({
      title,
      description,
      startDate,
      endDate,
      assignmentStartDate,
      assignmentEndDate,
      submissionDeadline,
      maxParticipants: maxParticipants || 100,
      tasksPerParticipant: tasksPerParticipant || 1,
      createdBy: req.user._id
    });

    await hackathon.save();

    await AuditLog.create({
      action: 'hackathon_created',
      performedBy: req.user._id,
      hackathonId: hackathon._id,
      ipAddress: getClientIp(req)
    });

    res.status(201).json({
      success: true,
      message: 'Hackathon created successfully',
      data: { hackathon }
    });
  } catch (error) {
    console.error('Create hackathon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create hackathon'
    });
  }
};

const getAllHackathons = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const hackathons = await Hackathon.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { hackathons }
    });
  } catch (error) {
    console.error('Get hackathons error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hackathons'
    });
  }
};

const getHackathonById = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('participants', 'name email skills')
      .populate('judges', 'name email');

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found'
      });
    }

    res.json({
      success: true,
      data: { hackathon }
    });
  } catch (error) {
    console.error('Get hackathon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hackathon'
    });
  }
};

const updateHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found'
      });
    }

    const allowedUpdates = [
      'title',
      'description',
      'startDate',
      'endDate',
      'assignmentStartDate',
      'assignmentEndDate',
      'submissionDeadline',
      'status',
      'maxParticipants',
      'tasksPerParticipant'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        hackathon[field] = req.body[field];
      }
    });

    await hackathon.save();

    await AuditLog.create({
      action: 'hackathon_updated',
      performedBy: req.user._id,
      hackathonId: hackathon._id,
      details: req.body,
      ipAddress: getClientIp(req)
    });

    res.json({
      success: true,
      message: 'Hackathon updated successfully',
      data: { hackathon }
    });
  } catch (error) {
    console.error('Update hackathon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update hackathon'
    });
  }
};

const deleteHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found'
      });
    }

    await hackathon.deleteOne();

    res.json({
      success: true,
      message: 'Hackathon deleted successfully'
    });
  } catch (error) {
    console.error('Delete hackathon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete hackathon'
    });
  }
};

const enrollParticipant = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found'
      });
    }

    if (hackathon.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot enroll in inactive hackathon'
      });
    }

    if (hackathon.participants.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this hackathon'
      });
    }

    if (hackathon.participants.length >= hackathon.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Hackathon is full'
      });
    }

    hackathon.participants.push(req.user._id);
    await hackathon.save();

    res.json({
      success: true,
      message: 'Enrolled successfully'
    });
  } catch (error) {
    console.error('Enroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enroll'
    });
  }
};

module.exports = {
  createHackathon,
  getAllHackathons,
  getHackathonById,
  updateHackathon,
  deleteHackathon,
  enrollParticipant
};