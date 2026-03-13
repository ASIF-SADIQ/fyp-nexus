const asyncHandler = require('express-async-handler');
const Deadline = require('../models/Deadline');
const User = require('../models/User');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const { sendEmail, sendProjectEmails } = require('../utils/emailService'); // ✅ Import both

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
  // ✅ AUTOMATED EMAIL & NOTIFICATION LOGIC
  // ==========================================
  try {
    let targetUserIds = [];
    const formattedDate = new Date(deadlineDate).toLocaleDateString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });

    if (scope === 'Global') {
      // 1. Find ALL students and supervisors
      const allUsers = await User.find({ 
        role: { $in: ['student', 'supervisor'] } 
      }).select('_id name email');
      targetUserIds = allUsers.map(u => u._id);

      // 📧 EMAIL: Send to everyone (Looping for Global)
      allUsers.forEach(user => {
        sendEmail(user._id, 'deadlineReminder', {
          projectName: "University FYP Schedule",
          deadline: deadlineDate,
          title: title,
          description: `A new global deadline "${title}" has been posted for all departments.`
        });
      });

    } else if (scope === 'Batch') {
      // 2. Find students & supervisors in specific batch/department
      const batchUsers = await User.find({ 
        role: { $in: ['student', 'supervisor'] },
        batch: { $regex: new RegExp(`^${batch}$`, 'i') },
        department: { $regex: new RegExp(`^${department}$`, 'i') }
      }).select('_id');
      targetUserIds = batchUsers.map(u => u._id);

      // 📧 EMAIL: Send to specific Batch/Dept
      batchUsers.forEach(user => {
        sendEmail(user._id, 'deadlineReminder', {
          projectName: `${department} - Batch ${batch}`,
          deadline: deadlineDate,
          title: title,
          description: `New deadline for your batch: "${title}".`
        });
      });

    } else if (scope === 'Group' && targetProject) {
      // 3. Find specific members and supervisor of the project
      const project = await Project.findById(targetProject).populate('leader members supervisor');
      if (project) {
        const members = [project.leader, ...(project.members || [])].filter(Boolean);
        targetUserIds = members.map(m => m._id);
        if (project.supervisor) targetUserIds.push(project.supervisor._id);

        // 📧 EMAIL: Use our bulk project mailer
        await sendProjectEmails(targetProject, 'deadlineReminder', {
          projectName: project.title,
          deadline: deadlineDate,
          title: title,
          description: `A specific deadline/task "${title}" has been assigned to your project group.`
        });
      }
    }

    // ✅ IN-APP NOTIFICATIONS (Bulk Insert)
    if (targetUserIds.length > 0) {
      const notificationsToInsert = targetUserIds.map(userId => ({
        recipient: userId,
        type: type === 'Task' ? 'Task' : 'Deadline',
        title: type === 'Task' ? '📋 New Task Assigned' : '⏰ New Deadline Posted',
        message: type === 'Task' 
          ? `A new task "${title}" is assigned. Due: ${formattedDate}`
          : `Important: "${title}" is due on ${formattedDate}.`,
        link: '/dashboard',
        isRead: false
      }));

      await Notification.insertMany(notificationsToInsert);
    }
    
  } catch (error) {
    console.error("❌ Notification Error:", error.message);
  }
  // ==========================================

  res.status(201).json(deadline);
});

/**
 * @desc    Get deadlines for a specific student (Hybrid Logic)
 */
const getStudentDeadlines = asyncHandler(async (req, res) => {
  const student = await User.findById(req.user._id);
  if (!student) { res.status(404); throw new Error('Student profile not found'); }

  const studentProject = await Project.findOne({
    $or: [{ leader: student._id }, { members: student._id }]
  });

  const deadlines = await Deadline.find({
    $or: [
      { scope: 'Global' },
      { 
        scope: 'Batch', 
        batch: { $regex: new RegExp(`^${student.batch}$`, 'i') },
        department: { $regex: new RegExp(`^${student.department}$`, 'i') } 
      },
      { scope: 'Group', targetProject: studentProject?._id }
    ]
  }).sort({ deadlineDate: 1 });

  res.json(deadlines);
});

/**
 * @desc    Get the full roadmap for a project group (Supervisor View)
 */
const getProjectRoadmap = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId).populate('leader');
  if (!project) { res.status(404); throw new Error('Project not found'); }

  const deadlines = await Deadline.find({
    $or: [
      { scope: 'Global' },
      { 
        scope: 'Batch', 
        batch: project.leader.batch, 
        department: project.leader.department 
      },
      { scope: 'Group', targetProject: project._id }
    ]
  }).sort({ deadlineDate: 1 });

  res.json(deadlines);
});

/**
 * @desc    Get all deadlines (Admin View)
 */
const getAllDeadlines = asyncHandler(async (req, res) => {
  const deadlines = await Deadline.find({})
    .populate('createdBy', 'name role')
    .sort({ createdAt: -1 });
  res.json(deadlines);
});

/**
 * @desc    Delete a deadline
 */
const deleteDeadline = asyncHandler(async (req, res) => {
  const deadline = await Deadline.findById(req.params.id);
  if (!deadline) { res.status(404); throw new Error('Deadline not found'); }

  const isAdmin = req.user.role === 'admin';
  const isCreator = deadline.createdBy?.toString() === req.user._id.toString();

  if (!isAdmin && !isCreator) {
    res.status(403);
    throw new Error('Access denied');
  }

  await deadline.deleteOne();
  res.json({ message: 'Deadline removed successfully', id: req.params.id });
});

module.exports = {
  createDeadline,
  getStudentDeadlines,
  getProjectRoadmap,
  getAllDeadlines,
  deleteDeadline
};