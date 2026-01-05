const TaskAssignment = require('../models/TaskAssignment');
const Task = require('../models/Task');
const Hackathon = require('../models/Hackathon');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { randomAssignment, smartAssignment } = require('../utils/assignmentLogic');
const { sendTaskAssignmentEmail } = require('../utils/emailService');
const { getClientIp } = require('../utils/helpers');

const manualAssignment = async (req, res) => {
  try {
    const { hackathonId, taskId, participantId } = req.body;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found'
      });
    }

    if (!hackathon.canAssignTasks()) {
      return res.status(400).json({
        success: false,
        message: 'Task assignment is not allowed at this time. Check hackathon status and assignment window.'
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const participant = await User.findById(participantId);
    if (!participant || participant.role !== 'participant') {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    if (!participant.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Participant email is not verified'
      });
    }

    const existingAssignment = await TaskAssignment.findOne({
      hackathonId,
      taskId,
      participantId
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'This task is already assigned to this participant'
      });
    }

    const participantAssignmentCount = await TaskAssignment.countDocuments({
      hackathonId,
      participantId
    });

    if (participantAssignmentCount >= hackathon.tasksPerParticipant) {
      return res.status(400).json({
        success: false,
        message: `Participant already has ${hackathon.tasksPerParticipant} task(s) assigned`
      });
    }

    const assignment = new TaskAssignment({
      hackathonId,
      taskId,
      participantId,
      assignmentMethod: 'manual',
      assignedBy: req.user._id
    });

    await assignment.save();

    task.isAssigned = true;
    task.assignedCount += 1;
    await task.save();

    await AuditLog.create({
      action: 'task_assigned',
      performedBy: req.user._id,
      targetUser: participantId,
      hackathonId,
      taskId,
      assignmentId: assignment._id,
      details: { method: 'manual' },
      ipAddress: getClientIp(req)
    });

    await sendTaskAssignmentEmail(participant, task, hackathon, 'Manual');

    res.status(201).json({
      success: true,
      message: 'Task assigned successfully',
      data: { assignment }
    });
  } catch (error) {
    console.error('Manual assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign task'
    });
  }
};

const randomAssignmentHandler = async (req, res) => {
  try {
    const { hackathonId } = req.body;

    const hackathon = await Hackathon.findById(hackathonId)
      .populate('participants');

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found'
      });
    }

    if (!hackathon.canAssignTasks()) {
      return res.status(400).json({
        success: false,
        message: 'Task assignment is not allowed at this time. Check hackathon status and assignment window.'
      });
    }

    const assignments = await randomAssignment(hackathonId, hackathon.tasksPerParticipant);

    const savedAssignments = [];

    for (const assignmentData of assignments) {
      const assignment = new TaskAssignment({
        hackathonId,
        taskId: assignmentData.taskId,
        participantId: assignmentData.participantId,
        assignmentMethod: 'random',
        assignedBy: req.user._id
      });

      await assignment.save();
      savedAssignments.push(assignment);

      const task = await Task.findById(assignmentData.taskId);
      task.isAssigned = true;
      task.assignedCount += 1;
      await task.save();

      await AuditLog.create({
        action: 'task_assigned',
        performedBy: req.user._id,
        targetUser: assignmentData.participantId,
        hackathonId,
        taskId: assignmentData.taskId,
        assignmentId: assignment._id,
        details: { method: 'random' },
        ipAddress: getClientIp(req)
      });

      await sendTaskAssignmentEmail(
        assignmentData.participant,
        assignmentData.task,
        hackathon,
        'Random'
      );
    }

    res.status(201).json({
      success: true,
      message: `Successfully assigned ${savedAssignments.length} tasks randomly`,
      data: {
        assignmentsCount: savedAssignments.length,
        assignments: savedAssignments
      }
    });
  } catch (error) {
    console.error('Random assignment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to perform random assignment'
    });
  }
};

const smartAssignmentHandler = async (req, res) => {
  try {
    const { hackathonId } = req.body;

    const hackathon = await Hackathon.findById(hackathonId)
      .populate('participants');

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found'
      });
    }

    if (!hackathon.canAssignTasks()) {
      return res.status(400).json({
        success: false,
        message: 'Task assignment is not allowed at this time. Check hackathon status and assignment window.'
      });
    }

    const assignments = await smartAssignment(hackathonId, hackathon.tasksPerParticipant);

    const savedAssignments = [];

    for (const assignmentData of assignments) {
      const assignment = new TaskAssignment({
        hackathonId,
        taskId: assignmentData.taskId,
        participantId: assignmentData.participantId,
        assignmentMethod: 'smart',
        assignedBy: req.user._id
      });

      await assignment.save();
      savedAssignments.push(assignment);

      const task = await Task.findById(assignmentData.taskId);
      task.isAssigned = true;
      task.assignedCount += 1;
      await task.save();

      await AuditLog.create({
        action: 'task_assigned',
        performedBy: req.user._id,
        targetUser: assignmentData.participantId,
        hackathonId,
        taskId: assignmentData.taskId,
        assignmentId: assignment._id,
        details: { 
          method: 'smart',
          matchScore: assignmentData.matchScore 
        },
        ipAddress: getClientIp(req)
      });

      await sendTaskAssignmentEmail(
        assignmentData.participant,
        assignmentData.task,
        hackathon,
        'Smart (Skill-based)'
      );
    }

    res.status(201).json({
      success: true,
      message: `Successfully assigned ${savedAssignments.length} tasks using smart algorithm`,
      data: {
        assignmentsCount: savedAssignments.length,
        assignments: savedAssignments
      }
    });
  } catch (error) {
    console.error('Smart assignment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to perform smart assignment'
    });
  }
};

const getAssignmentsByHackathon = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    const assignments = await TaskAssignment.find({ hackathonId })
      .populate('taskId')
      .populate('participantId', 'name email skills')
      .populate('assignedBy', 'name email')
      .sort({ assignedAt: -1 });

    res.json({
      success: true,
      data: { assignments }
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments'
    });
  }
};

const getMyAssignments = async (req, res) => {
  try {
    const assignments = await TaskAssignment.find({ 
      participantId: req.user._id 
    })
      .populate('taskId')
      .populate('hackathonId')
      .sort({ assignedAt: -1 });

    res.json({
      success: true,
      data: { assignments }
    });
  } catch (error) {
    console.error('Get my assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments'
    });
  }
};

const reassignTask = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { newParticipantId } = req.body;

    const assignment = await TaskAssignment.findById(assignmentId)
      .populate('hackathonId')
      .populate('taskId');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    const hackathon = assignment.hackathonId;

    if (!hackathon.canAssignTasks()) {
      return res.status(400).json({
        success: false,
        message: 'Task reassignment is not allowed at this time'
      });
    }

    const newParticipant = await User.findById(newParticipantId);
    if (!newParticipant || newParticipant.role !== 'participant') {
      return res.status(404).json({
        success: false,
        message: 'New participant not found'
      });
    }

    const existingAssignment = await TaskAssignment.findOne({
      hackathonId: hackathon._id,
      taskId: assignment.taskId._id,
      participantId: newParticipantId
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'This task is already assigned to the new participant'
      });
    }

    const oldParticipantId = assignment.participantId;

    await AuditLog.create({
      action: 'task_reassigned',
      performedBy: req.user._id,
      targetUser: oldParticipantId,
      hackathonId: hackathon._id,
      taskId: assignment.taskId._id,
      assignmentId: assignment._id,
      details: {
        oldParticipant: oldParticipantId,
        newParticipant: newParticipantId
      },
      ipAddress: getClientIp(req)
    });

    assignment.participantId = newParticipantId;
    assignment.assignedAt = new Date();
    await assignment.save();

    await sendTaskAssignmentEmail(
      newParticipant,
      assignment.taskId,
      hackathon,
      'Reassigned'
    );

    res.json({
      success: true,
      message: 'Task reassigned successfully',
      data: { assignment }
    });
  } catch (error) {
    console.error('Reassign task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reassign task'
    });
  }
};

const unassignTask = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await TaskAssignment.findById(assignmentId)
      .populate('hackathonId')
      .populate('taskId');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    if (assignment.status === 'submitted' || assignment.status === 'evaluated') {
      return res.status(400).json({
        success: false,
        message: 'Cannot unassign a task that has been submitted or evaluated'
      });
    }

    await AuditLog.create({
      action: 'task_unassigned',
      performedBy: req.user._id,
      targetUser: assignment.participantId,
      hackathonId: assignment.hackathonId._id,
      taskId: assignment.taskId._id,
      assignmentId: assignment._id,
      ipAddress: getClientIp(req)
    });

    const task = assignment.taskId;
    task.assignedCount = Math.max(0, task.assignedCount - 1);
    if (task.assignedCount === 0) {
      task.isAssigned = false;
    }
    await task.save();

    await assignment.deleteOne();

    res.json({
      success: true,
      message: 'Task unassigned successfully'
    });
  } catch (error) {
    console.error('Unassign task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unassign task'
    });
  }
};

module.exports = {
  manualAssignment,
  randomAssignmentHandler,
  smartAssignmentHandler,
  getAssignmentsByHackathon,
  getMyAssignments,
  reassignTask,
  unassignTask
};