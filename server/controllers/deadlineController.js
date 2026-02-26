const asyncHandler = require('express-async-handler');
const Deadline = require('../models/Deadline');
const User = require('../models/User');
const Project = require('../models/Project');
const Notification = require('../models/Notification'); // ✅ Make sure this is imported!

/**
 * @desc    Create a new deadline (Admin or Supervisor)
 * @route   POST /api/deadlines
 */
const createDeadline = asyncHandler(async (req, res) => {
  const { 
    title, 
    description, 
    deadlineDate, 
    batch, 
    department, 
    scope, 
    targetProject, 
    type, 
    isHardDeadline 
  } = req.body;

  if (!title || !deadlineDate || !scope) {
    res.status(400);
    throw new Error('Please fill all required fields (Title, Date, and Scope)');
  }

  const deadline = await Deadline.create({
    title,
    description,
    deadlineDate,
    batch,
    department,
    scope,
    targetProject,
    type,
    isHardDeadline,
    createdBy: req.user._id
  });

  // ==========================================
  // ✅ AUTOMATED NOTIFICATION BROADCAST LOGIC
  // ==========================================
  try {
    let targetUserIds = [];

    if (scope === 'Global') {
      // Find ALL students
      const students = await User.find({ role: 'student' }).select('_id');
      targetUserIds = students.map(s => s._id);

    } else if (scope === 'Batch') {
      // Find students in specific batch and department
      const students = await User.find({ 
        role: 'student',
        batch: { $regex: new RegExp(`^${batch}$`, 'i') },
        department: { $regex: new RegExp(`^${department}$`, 'i') }
      }).select('_id');
      targetUserIds = students.map(s => s._id);

    } else if (scope === 'Group' && targetProject) {
      // Find specific members of the target project
      const project = await Project.findById(targetProject).select('leader members');
      if (project) {
        targetUserIds = [project.leader, ...project.members];
      }
    }

    // Create notifications in bulk if we found targets
    if (targetUserIds.length > 0) {
      const formattedDate = new Date(deadlineDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const notificationsToInsert = targetUserIds.map(userId => ({
        recipient: userId,
        type: 'Deadline', // Or 'System', depending on your Notification model enum
        title: '🚨 New Deadline Posted',
        message: `"${title}" is due on ${formattedDate}.`,
        link: '/dashboard', // Links back to the overview/deadline tab
        isRead: false
      }));

      await Notification.insertMany(notificationsToInsert);
    }
  } catch (error) {
    console.error("Error broadcasting deadline notifications:", error);
    // Note: We don't throw an error here because the deadline was already created successfully.
    // We don't want a notification failure to crash the deadline creation process.
  }
  // ==========================================

  res.status(201).json(deadline);
});

/**
 * @desc    Get deadlines for a specific student (Hybrid Logic)
 * @route   GET /api/deadlines/my
 */
const getStudentDeadlines = asyncHandler(async (req, res) => {
  const student = await User.findById(req.user._id);

  if (!student) {
    res.status(404);
    throw new Error('Student profile not found');
  }

  // Find the project/group the student belongs to
  const studentProject = await Project.findOne({
    $or: [{ leader: student._id }, { members: student._id }]
  });

  // Hybrid Query: Admin Global + Batch Specific + Supervisor Group Tasks
  const deadlines = await Deadline.find({
    $or: [
      { scope: 'Global' },
      { 
        scope: 'Batch', 
        batch: { $regex: new RegExp(`^${student.batch}$`, 'i') },
        department: { $regex: new RegExp(`^${student.department}$`, 'i') } 
      },
      { 
        scope: 'Group', 
        targetProject: studentProject?._id 
      }
    ]
  }).sort({ deadlineDate: 1 });

  res.json(deadlines);
});

/**
 * @desc    Get the full roadmap for a project group (Supervisor View)
 * @route   GET /api/deadlines/project/:projectId
 */
const getProjectRoadmap = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId).populate('leader');

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  // Security: Only the assigned supervisor or an admin can see this roadmap
  const isSupervisor = project.supervisor?.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isSupervisor && !isAdmin) {
    res.status(401);
    throw new Error('Not authorized to view this roadmap');
  }

  const deadlines = await Deadline.find({
    $or: [
      { scope: 'Global' },
      { 
        scope: 'Batch', 
        batch: project.leader.batch, 
        department: project.leader.department 
      },
      { 
        scope: 'Group', 
        targetProject: project._id 
      }
    ]
  }).sort({ deadlineDate: 1 });

  res.json(deadlines);
});

/**
 * @desc    Get all deadlines (Admin/Supervisor View)
 * @route   GET /api/deadlines
 */
const getAllDeadlines = asyncHandler(async (req, res) => {
  const deadlines = await Deadline.find({})
    .populate('createdBy', 'name role')
    .sort({ createdAt: -1 });
  res.json(deadlines);
});

/**
 * ✅ UPDATED: Delete a deadline
 * @desc    Allows Admins to delete anything, Supervisors can delete their own tasks.
 * @route   DELETE /api/deadlines/:id
 */
const deleteDeadline = asyncHandler(async (req, res) => {
  // 1. Find the deadline
  const deadline = await Deadline.findById(req.params.id);

  if (!deadline) {
    res.status(404);
    throw new Error('Deadline not found');
  }

  // 2. Authorization Check logic
  // Use .toString() to ensure matching between ObjectID and Request User ID
  const isAdmin = req.user.role === 'admin';
  const isCreator = deadline.createdBy && deadline.createdBy.toString() === req.user._id.toString();

  // If neither an admin nor the creator, block the action
  if (!isAdmin && !isCreator) {
    res.status(403);
    throw new Error('Access denied: You can only delete tasks you created.');
  }

  // 3. Execution
  await deadline.deleteOne();
  
  res.json({ 
    message: 'Deadline removed successfully',
    id: req.params.id 
  });
});

module.exports = {
  createDeadline,
  getStudentDeadlines,
  getProjectRoadmap,
  getAllDeadlines,
  deleteDeadline
};