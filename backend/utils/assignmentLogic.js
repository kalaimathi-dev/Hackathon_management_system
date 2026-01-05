const Task = require('../models/Task');
const TaskAssignment = require('../models/TaskAssignment');
const User = require('../models/User');

const getAvailableTasks = async (hackathonId) => {
  return await Task.find({ hackathonId });
};

const getParticipantsWithoutFullAssignment = async (hackathonId, tasksPerParticipant) => {
  const assignments = await TaskAssignment.aggregate([
    { $match: { hackathonId } },
    { $group: { _id: '$participantId', count: { $sum: 1 } } },
    { $match: { count: { $lt: tasksPerParticipant } } }
  ]);

  const participantIdsWithAssignments = assignments.map(a => a._id);
  
  const allParticipants = await User.find({
    role: 'participant',
    isEmailVerified: true
  });

  const participantsNeedingTasks = allParticipants.filter(p => {
    const assignment = assignments.find(a => a._id.toString() === p._id.toString());
    return !assignment || assignment.count < tasksPerParticipant;
  });

  return participantsNeedingTasks;
};

const randomAssignment = async (hackathonId, tasksPerParticipant) => {
  const tasks = await getAvailableTasks(hackathonId);
  const participants = await getParticipantsWithoutFullAssignment(hackathonId, tasksPerParticipant);

  if (tasks.length === 0) {
    throw new Error('No tasks available for assignment');
  }

  if (participants.length === 0) {
    throw new Error('No participants need task assignment');
  }

  const assignments = [];
  const existingAssignments = await TaskAssignment.find({ hackathonId });
  
  const isAlreadyAssigned = (participantId, taskId) => {
    return existingAssignments.some(
      a => a.participantId.toString() === participantId.toString() && 
           a.taskId.toString() === taskId.toString()
    );
  };

  for (const participant of participants) {
    const currentAssignmentCount = existingAssignments.filter(
      a => a.participantId.toString() === participant._id.toString()
    ).length;

    const tasksNeeded = tasksPerParticipant - currentAssignmentCount;

    for (let i = 0; i < tasksNeeded; i++) {
      const availableTasks = tasks.filter(
        task => !isAlreadyAssigned(participant._id, task._id)
      );

      if (availableTasks.length === 0) break;

      const randomIndex = Math.floor(Math.random() * availableTasks.length);
      const selectedTask = availableTasks[randomIndex];

      assignments.push({
        participantId: participant._id,
        taskId: selectedTask._id,
        task: selectedTask,
        participant: participant
      });

      existingAssignments.push({
        participantId: participant._id,
        taskId: selectedTask._id
      });
    }
  }

  return assignments;
};

const smartAssignment = async (hackathonId, tasksPerParticipant) => {
  const tasks = await getAvailableTasks(hackathonId);
  const participants = await getParticipantsWithoutFullAssignment(hackathonId, tasksPerParticipant);

  if (tasks.length === 0) {
    throw new Error('No tasks available for assignment');
  }

  if (participants.length === 0) {
    throw new Error('No participants need task assignment');
  }

  const assignments = [];
  const existingAssignments = await TaskAssignment.find({ hackathonId });

  const isAlreadyAssigned = (participantId, taskId) => {
    return existingAssignments.some(
      a => a.participantId.toString() === participantId.toString() && 
           a.taskId.toString() === taskId.toString()
    );
  };

  const calculateMatchScore = (participantSkills, taskTags) => {
    if (!participantSkills || participantSkills.length === 0) return 0;
    if (!taskTags || taskTags.length === 0) return 0;

    const normalizedSkills = participantSkills.map(s => s.toLowerCase());
    const normalizedTags = taskTags.map(t => t.toLowerCase());

    const matches = normalizedSkills.filter(skill => 
      normalizedTags.some(tag => tag.includes(skill) || skill.includes(tag))
    );

    return matches.length / Math.max(normalizedSkills.length, normalizedTags.length);
  };

  for (const participant of participants) {
    const currentAssignmentCount = existingAssignments.filter(
      a => a.participantId.toString() === participant._id.toString()
    ).length;

    const tasksNeeded = tasksPerParticipant - currentAssignmentCount;

    for (let i = 0; i < tasksNeeded; i++) {
      const availableTasks = tasks.filter(
        task => !isAlreadyAssigned(participant._id, task._id)
      );

      if (availableTasks.length === 0) break;

      const tasksWithScores = availableTasks.map(task => ({
        task,
        score: calculateMatchScore(participant.skills, task.tags)
      }));

      tasksWithScores.sort((a, b) => b.score - a.score);

      const bestMatch = tasksWithScores[0];

      assignments.push({
        participantId: participant._id,
        taskId: bestMatch.task._id,
        task: bestMatch.task,
        participant: participant,
        matchScore: bestMatch.score
      });

      existingAssignments.push({
        participantId: participant._id,
        taskId: bestMatch.task._id
      });
    }
  }

  return assignments;
};

module.exports = {
  randomAssignment,
  smartAssignment,
  getAvailableTasks,
  getParticipantsWithoutFullAssignment
};