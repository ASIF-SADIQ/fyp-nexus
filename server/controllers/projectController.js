const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Project = require('../models/Project');
const User = require('../models/User');
const Deadline = require('../models/Deadline');
const Notification = require('../models/Notification');

/**
 * ✅ HELPER FUNCTION: RECALCULATE MEMBER PROGRESS
 * Updates percentage bars for each member based on assigned tasks.
 */
const syncProjectProgress = async (project) => {
    const allStudentIds = [...new Set([
        project.leader?.toString(), 
        ...(project.members ? project.members.map(m => m.toString()) : [])
    ].filter(Boolean))];

    project.memberProgress = allStudentIds.map(mId => {
        const memberTasks = project.tasks.filter(t => t.assignedTo?.toString() === mId);
        const total = memberTasks.length;
        const done = memberTasks.filter(t => ['Done', 'Completed'].includes(t.status)).length;

        return {
            memberId: mId,
            percentage: total > 0 ? Math.round((done / total) * 100) : 0,
            tasksDone: done,
            totalTasksAssigned: total
        };
    });
};

/**
 * ✅ HELPER FUNCTION: DYNAMIC CAPACITY CHECK
 * Fixes the "undefined is at maximum capacity" error.
 */
const checkSupervisorCapacity = async (supervisorId) => {
    const supervisor = await User.findById(supervisorId);
    if (!supervisor) return { isFull: true, name: "Selected Teacher", message: "Supervisor not found." };

    const trueActiveCount = await Project.countDocuments({
        supervisor: supervisorId,
        status: 'Ongoing'
    });

    const limit = supervisor.maxProjects || 5; 
    
    if (supervisor.currentProjectsCount !== trueActiveCount) {
        await User.findByIdAndUpdate(supervisorId, { currentProjectsCount: trueActiveCount });
    }

    return {
        isFull: trueActiveCount >= limit,
        current: trueActiveCount,
        limit,
        name: supervisor.name
    };
};

/**
 * ==========================================
 * PROJECT FETCHING & CREATION
 * ==========================================
 */

// @desc    Get all projects (Admin/General)
const getProjects = asyncHandler(async (req, res) => {
    const { department, status } = req.query;
    let query = {};
    if (department && !['All', 'All Departments', ''].includes(department)) query.department = department;
    if (status && !['All', ''].includes(status)) query.status = status;

    const projects = await Project.find(query)
        .populate('leader', 'name email department rollNo batch profilePicture bio skills links')
        .populate('members', 'name email rollNo profilePicture bio skills links')
        .populate('supervisor', 'name email department expertise currentProjectsCount maxProjects')
        .populate('tasks.assignedTo', 'name profilePicture') 
        .sort({ createdAt: -1 });

    res.json(projects);
});

// @desc    Get Student's Own Projects
const getMyProjects = asyncHandler(async (req, res) => {
    const projects = await Project.find({ $or: [{ leader: req.user._id }, { members: req.user._id }] })
    .populate('members leader', 'name email rollNo profilePicture')
    .populate('supervisor', 'name email expertise')
    .populate('tasks.assignedTo', 'name profilePicture');
    res.json(projects);
});

// @desc    Get specific project by ID
const getProjectById = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id)
        .populate('leader members', 'name email rollNo profilePicture department')
        .populate('supervisor', 'name email expertise department')
        .populate('tasks.assignedTo', 'name profilePicture');

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }
    res.json(project);
});

// @desc    Create a new project (Student Proposal)
const createProject = asyncHandler(async (req, res) => {
    const { title, description, technologies, domain, teammateRollNumbers } = req.body;

    if (!title || !description || !domain) {
        res.status(400);
        throw new Error('Please provide Title, Description, and Domain');
    }

    if (!req.file) {
        res.status(400);
        throw new Error('Project Proposal PDF is required');
    }

    const leaderUser = await User.findById(req.user._id);
    if (leaderUser.hasProject) {
        res.status(400);
        throw new Error('You already have an active project or proposal.');
    }

    let memberIds = [leaderUser._id]; 
    if (teammateRollNumbers?.trim()) {
        const rollNos = teammateRollNumbers.split(',').map(r => r.trim().toUpperCase()).filter(r => r !== "");
        const partners = await User.find({ rollNo: { $in: rollNos }, role: 'student' });
        memberIds = [...new Set([...memberIds, ...partners.map(p => p._id)])];
    }

    const project = await Project.create({
        leader: leaderUser._id,
        title,
        description,
        technologies: Array.isArray(technologies) ? technologies.join(', ') : (technologies || ""),
        domain,
        department: leaderUser.department || 'General', 
        proposalDocument: req.file.secure_url || req.file.path,
        members: memberIds,
        status: 'Pending'
    });

    await User.updateMany({ _id: { $in: memberIds } }, { $set: { hasProject: true, project: project._id, isLeader: false } });
    leaderUser.isLeader = true;
    await leaderUser.save();

    res.status(201).json(project);
});

/**
 * ==========================================
 * SUPERVISOR & STATUS MANAGEMENT
 * ==========================================
 */

// @desc    Admin: Update Status or Assign Supervisor
const updateProjectStatus = asyncHandler(async (req, res) => {
    const { status, adminFeedback, supervisorId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) { res.status(404); throw new Error('Project not found'); }

    if (supervisorId) {
        const capacity = await checkSupervisorCapacity(supervisorId);
        if (capacity.isFull && project.supervisor?.toString() !== supervisorId) {
            res.status(400);
            throw new Error(`${capacity.name} is at maximum capacity.`);
        }
        project.supervisor = supervisorId;
        project.status = 'Ongoing'; 
    } 
    
    if (status) project.status = status;
    if (adminFeedback) project.adminFeedback = adminFeedback;
    await project.save();
    res.json(project);
});

// @desc    Student Request Supervisor
const requestSupervisor = asyncHandler(async (req, res) => {
    const { teacherId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) { res.status(404); throw new Error('Project not found'); }
    if (!teacherId) { res.status(400); throw new Error('Please select a supervisor'); }

    const capacity = await checkSupervisorCapacity(teacherId);
    if (capacity.isFull) {
        res.status(400);
        throw new Error(`${capacity.name} is at maximum project capacity.`);
    }
    
    project.supervisionRequests.push({ teacherId, requestStatus: 'Sent', requestDate: Date.now() });
    project.supervisor = teacherId;
    project.supervisorStatus = 'Pending';
    
    await project.save();

    await Notification.create({
        recipient: teacherId,
        sender: req.user._id,
        type: 'System',
        title: 'New Supervision Request',
        message: `Project "${project.title}" requested your supervision.`,
        link: '/dashboard',
        relatedId: project._id
    });

    res.json({ message: `Request sent to ${capacity.name} successfully`, project });
});

// @desc    Teacher Respond to Request
const respondToRequest = asyncHandler(async (req, res) => {
    const { action } = req.body; 
    const project = await Project.findById(req.params.id);
    if (!project) { res.status(404); throw new Error('Project not found'); }

    const requestIndex = project.supervisionRequests.findIndex(
        r => r.teacherId.toString() === req.user._id.toString() && r.requestStatus === 'Sent'
    );

    if (requestIndex === -1) { res.status(401); throw new Error('No pending request.'); }

    if (action === 'Accept') {
        project.supervisor = req.user._id;
        project.supervisorStatus = 'Approved';
        project.status = 'Ongoing';
        project.supervisionRequests[requestIndex].requestStatus = 'Accepted';
        await User.findByIdAndUpdate(req.user._id, { $inc: { currentProjectsCount: 1 } });
    } else {
        project.supervisionRequests[requestIndex].requestStatus = 'Rejected';
        project.supervisor = null;
        project.supervisorStatus = 'Rejected';
    }

    await project.save();
    res.json({ message: `Success: ${action}`, project });
});

/**
 * ==========================================
 * TASK & ANALYTICS
 * ==========================================
 */

// @desc    Add Task
const addTask = asyncHandler(async (req, res) => {
    const { title, assignedTo, priority, dueDate } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) { res.status(404); throw new Error('Project not found'); }

    project.tasks.push({ title, assignedTo: assignedTo || null, priority: priority || 'Medium', dueDate, status: 'To Do' });
    await syncProjectProgress(project);
    await project.save();

    res.json(project);
});

// @desc    Claim Task (Critical for AI Roadmap)
const claimTask = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);
    if (!project) { res.status(404); throw new Error('Project not found'); }

    const task = project.tasks.id(req.params.taskId);
    if (!task) { res.status(404); throw new Error('Task not found'); }

    if (task.assignedTo) {
        res.status(400);
        throw new Error('Task is already assigned');
    }

    task.assignedTo = req.user._id;
    await syncProjectProgress(project);
    await project.save();

    res.json(project);
});

// @desc    Update Task Status
const updateTaskStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) { res.status(404); throw new Error('Project not found'); }

    const task = project.tasks.id(req.params.taskId);
    if (!task) { res.status(404); throw new Error('Task not found'); }

    task.status = status;
    await syncProjectProgress(project);
    await project.save();

    res.json(project);
});

// ✅ NEW FUNCTION: Add supervisor feedback to a task
// @desc    Add supervisor feedback to a task
// @route   PATCH /api/projects/:id/tasks/:taskId/feedback
// @access  Private (Supervisors only)
// 1. Change 'export const' to 'const'
// @desc    Add supervisor feedback to a task
// @route   PATCH /api/projects/:id/tasks/:taskId/feedback
// @access  Private (Supervisors only)
const addTaskFeedback = async (req, res) => {
  try {
    const { id, taskId } = req.params; 
    const { feedback } = req.body;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const task = project.tasks.id(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // 1. Save the feedback to the Project
    task.feedback = feedback;
    project.markModified('tasks'); 
    await project.save();

    // 2. 🌟 CREATE THE NOTIFICATION 🌟
    // If the task belongs to a specific student, alert them.
    // If it is "Unassigned", alert the Project Leader so they know.
    const recipientId = task.assignedTo ? task.assignedTo : project.leader;
    
    // Assuming you have middleware that puts the logged-in user in `req.user`
    const senderId = req.user ? req.user._id : null; 

    await Notification.create({
      recipient: recipientId,
      sender: senderId,
      title: "New Supervisor Feedback",
      message: `Your supervisor updated the instructions for: "${task.title}"`,
      type: "Feedback",
      link: `/dashboard`, // Or whatever route your student tracker is on
      relatedId: project._id
    });

    res.status(200).json({ message: "Feedback saved and notification sent!" });
  } catch (error) {
    console.error("🔥 Controller Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
// 2. Add it to your module exports at the bottom of the file
// Look for where your other functions are exported and add it there:

/**
 * ==========================================
 * SUBMISSIONS & GRADING
 * ==========================================
 */

// @desc    Submit Deliverable (Student)
const submitDeliverable = asyncHandler(async (req, res) => {
    const { deadlineId } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) { res.status(404); throw new Error('Project not found'); }
    
    const deadline = await Deadline.findById(deadlineId);
    const newSubmission = {
      deadlineId, 
      title: deadline?.title || "Deliverable", 
      fileUrl: req.file.secure_url || req.file.path,
      submittedAt: new Date(), 
      status: 'Submitted'
    };
  
    project.submissions.push(newSubmission);
    await project.save();
    res.json({ message: `Submitted`, submission: newSubmission });
});

// @desc    Supervisor: Grade a Submission
const gradeSubmission = asyncHandler(async (req, res) => {
    const { submissionId, marks, feedback } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) { res.status(404); throw new Error('Project not found'); }
    const submission = project.submissions.id(submissionId);
    if (!submission) { res.status(404); throw new Error('Submission not found'); }

    submission.marks = marks;
    submission.feedback = feedback;
    submission.status = 'Approved'; 
    await project.save();
    res.json({ message: 'Grade updated successfully', project });
});

// @desc    Supervisor Dashboard
const getSupervisorDashboard = asyncHandler(async (req, res) => {
    const activeProjects = await Project.find({ supervisor: req.user._id, status: { $in: ['Ongoing', 'Approved', 'Completed'] } })
        .populate('leader members', 'name email rollNo profilePicture')
        .sort({ updatedAt: -1 });
    const pendingRequests = await Project.find({ supervisionRequests: { $elemMatch: { teacherId: req.user._id, requestStatus: 'Sent' } } })
        .populate('leader members', 'name email rollNo profilePicture');
    res.json({ activeProjects, pendingRequests });
});

/**
 * ==========================================
 * EXPORTS (13 Functions)
 * ==========================================
 */
module.exports = {
    getProjects,
    getProjectById, 
    createProject,
    updateProjectStatus,
    requestSupervisor,
    respondToRequest,
    getSupervisorDashboard, 
    getMyProjects,
    submitDeliverable,
    gradeSubmission,
    addTask,
    claimTask, 

    updateTaskStatus,
    addTaskFeedback // ✅ NEW EXPORT ADDED HERE
};