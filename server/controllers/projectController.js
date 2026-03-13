const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Project = require('../models/Project');
const User = require('../models/User');
const Deadline = require('../models/Deadline');
const Notification = require('../models/Notification');
const { sendEmail, sendProjectEmails } = require('../utils/emailService');

/**
 * ✅ HELPER FUNCTION: RECALCULATE MEMBER PROGRESS
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

const getMyProjects = asyncHandler(async (req, res) => {
    const projects = await Project.find({ $or: [{ leader: req.user._id }, { members: req.user._id }] })
    .populate('members leader', 'name email rollNo profilePicture')
    .populate('supervisor', 'name email expertise')
    .populate('tasks.assignedTo', 'name profilePicture');
    res.json(projects);
});

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

    // ✅ NOTIFY ADMINS: In-app notification
    const admins = await User.find({ role: 'admin' }); 
    if (admins.length > 0) {
        const adminNotifications = admins.map(admin => ({
            recipient: admin._id,
            sender: leaderUser._id,
            title: 'New Project Proposal',
            message: `${leaderUser.name} submitted a new project proposal: "${project.title}".`,
            type: 'System', 
            link: `/projects/${project._id}`, 
            relatedId: project._id
        }));
        await Notification.insertMany(adminNotifications);

        // ✅ 📧 EMAIL TRIGGER: Notify Admins via Email
        for (const admin of admins) {
            await sendEmail(admin._id, 'systemNotification', {
                title: 'New Project Proposal Submitted',
                message: `Student ${leaderUser.name} has submitted a new project proposal titled "${project.title}". Please log in to the NEXUS Admin Panel to review it.`
            });
        }
    }

    res.status(201).json(project);
});

/**
 * ==========================================
 * SUPERVISOR & STATUS MANAGEMENT
 * ==========================================
 */

const updateProjectStatus = asyncHandler(async (req, res) => {
    const { status, adminFeedback, supervisorId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) { res.status(404); throw new Error('Project not found'); }

    const previousStatus = project.status; 

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

    // ✅ NOTIFY STUDENTS: In-app
    if (status && status !== previousStatus) {
        let notifTitle = 'Project Status Updated';
        let notifType = 'System';
        let notifMessage = `Your project "${project.title}" status changed to ${status}.`;

        if (status === 'Approved') {
            notifTitle = 'Proposal Approved!';
            notifType = 'Approval';
            notifMessage = `Great news! Your project proposal "${project.title}" has been approved by the Admin.`;
        } else if (status === 'Rejected') {
            notifTitle = 'Proposal Rejected';
            notifType = 'Rejection';
            notifMessage = `Your project proposal "${project.title}" was rejected. Feedback: ${adminFeedback || 'None'}`;
        }

        const teamMembers = [project.leader, ...(project.members || [])].filter(Boolean);
        if (teamMembers.length > 0) {
            const notificationPromises = teamMembers.map(memberId => 
                Notification.create({
                    recipient: memberId,
                    sender: req.user._id, 
                    title: notifTitle,
                    message: notifMessage,
                    type: notifType,
                    link: `/projects/${project._id}`, 
                    relatedId: project._id
                })
            );
            await Promise.all(notificationPromises);
        }

        // ✅ 📧 EMAIL TRIGGER: Send team-wide status update email
        await sendProjectEmails(project._id, status === 'Approved' ? 'projectUpdate' : 'systemNotification', {
            projectName: project.title,
            message: notifMessage
        });
    }

    res.json(project);
});

const requestSupervisor = asyncHandler(async (req, res) => {
    const { teacherId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) { res.status(404); throw new Error('Project not found'); }
    if (!teacherId) { res.status(400); throw new Error('Please select a supervisor'); }

    const alreadyRequested = project.supervisionRequests.some(
        (req) => req.teacherId.toString() === teacherId && req.requestStatus === 'Sent'
    );
    if (alreadyRequested) {
        res.status(400); throw new Error('You have already sent a request to this teacher.');
    }

    const capacity = await checkSupervisorCapacity(teacherId);
    if (capacity.isFull) {
        res.status(400);
        throw new Error(`${capacity.name} is at maximum project capacity.`);
    }
    
    project.supervisionRequests.push({ teacherId, requestStatus: 'Sent', requestDate: Date.now() });
    await project.save();

    // ✅ NOTIFY SUPERVISOR: In-app
    await Notification.create({
        recipient: teacherId,
        sender: req.user._id,
        type: 'System',
        title: 'New Supervision Request',
        message: `Project "${project.title}" requested your supervision.`,
        link: '/dashboard',
        relatedId: project._id
    });

    // ✅ 📧 EMAIL TRIGGER: Send email to Teacher about the request
    await sendEmail(teacherId, 'systemNotification', {
        title: 'New Supervision Request',
        message: `A student group has requested you to supervise their project: "${project.title}". Please visit the NEXUS Portal to Accept or Reject.`
    });

    res.json({ message: `Request sent to ${capacity.name} successfully`, project });
});

const respondToRequest = asyncHandler(async (req, res) => {
    const { action } = req.body; 
    const project = await Project.findById(req.params.id);
    if (!project) { res.status(404); throw new Error('Project not found'); }

    const requestIndex = project.supervisionRequests.findIndex(
        r => r.teacherId.toString() === req.user._id.toString() && r.requestStatus === 'Sent'
    );

    if (requestIndex === -1) { res.status(401); throw new Error('No pending request.'); }

    let notifTitle = '';
    let notifMessage = '';
    let notifType = '';

    if (action === 'Accept') {
        project.supervisor = req.user._id;
        project.supervisorStatus = 'Approved';
        project.status = 'Ongoing';
        project.supervisionRequests[requestIndex].requestStatus = 'Accepted';
        await User.findByIdAndUpdate(req.user._id, { $inc: { currentProjectsCount: 1 } });
        
        notifTitle = 'Supervision Request Accepted';
        notifMessage = `Supervisor ${req.user.name} has accepted your request for "${project.title}".`;
        notifType = 'Approval';
    } else {
        project.supervisionRequests[requestIndex].requestStatus = 'Rejected';
        project.supervisor = null;
        project.supervisorStatus = 'Rejected';
        
        notifTitle = 'Supervision Request Rejected';
        notifMessage = `Your supervision request for "${project.title}" was declined by the supervisor.`;
        notifType = 'Rejection';
    }

    await project.save();

    // ✅ NOTIFY STUDENTS: In-app
    const teamMembers = [project.leader, ...(project.members || [])].filter(Boolean);
    const notificationPromises = teamMembers.map(memberId => 
        Notification.create({
            recipient: memberId,
            sender: req.user._id,
            title: notifTitle,
            message: notifMessage,
            type: notifType,
            link: `/projects/${project._id}`
        })
    );
    await Promise.all(notificationPromises);

    // ✅ 📧 EMAIL TRIGGER: Send response email to all students
    await sendProjectEmails(project._id, action === 'Accept' ? 'projectUpdate' : 'systemNotification', {
        projectName: project.title,
        message: notifMessage
    }, req.user._id);

    res.json({ message: `Success: ${action}`, project });
});

/**
 * ==========================================
 * TASK & ANALYTICS
 * ==========================================
 */

const addTask = asyncHandler(async (req, res) => {
    const { title, assignedTo, priority, dueDate } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) { 
        res.status(404); 
        throw new Error('Project not found'); 
    }

    // 1. Add the task to the database
    project.tasks.push({ 
        title, 
        assignedTo: assignedTo || null, 
        priority: priority || 'Medium', 
        dueDate, 
        status: 'To Do' 
    });

    await syncProjectProgress(project);
    await project.save();

    // ✅ 📧 EMAIL TRIGGER: Notify the WHOLE PROJECT TEAM
    // We pass req.user._id as the 4th argument to EXCLUDE the supervisor
    const emailData = {
        projectName: project.title,
        taskTitle: title,
        description: `A new task "${title}" has been added to your project. 
                      Priority: ${priority || 'Medium'}. 
                      Assigned to: ${assignedTo ? 'A team member' : 'Unassigned'}.`
    };

    await sendProjectEmails(project._id, 'taskAssignment', emailData, req.user._id);

    res.json(project);
});
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

const updateTaskStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) { res.status(404); throw new Error('Project not found'); }

    const task = project.tasks.id(req.params.taskId);
    if (!task) { res.status(404); throw new Error('Task not found'); }

    task.status = status;
    await syncProjectProgress(project);
    await project.save();

    // ✅ 📧 EMAIL TRIGGER: Notify Supervisor of Milestone Progress
    if (status === 'Done' || status === 'Completed') {
        if (project.supervisor) {
            await sendEmail(project.supervisor, 'systemNotification', {
                title: 'Task Milestone Reached',
                message: `The task "${task.title}" in project "${project.title}" has been completed by ${req.user.name}.`
            });
        }
    }

    res.json(project);
});

const addTaskFeedback = async (req, res) => {
  try {
    const { id, taskId } = req.params; 
    const { feedback } = req.body;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const task = project.tasks.id(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.feedback = feedback;
    project.markModified('tasks'); 
    await project.save();

    // ✅ NOTIFY STUDENT: In-app
    const recipientId = task.assignedTo ? task.assignedTo : project.leader;
    await Notification.create({
      recipient: recipientId,
      sender: req.user._id,
      title: "New Supervisor Feedback",
      message: `Your supervisor updated the instructions for: "${task.title}"`,
      type: "Feedback",
      link: `/projects/${project._id}`, 
      relatedId: project._id
    });

    // ✅ 📧 EMAIL TRIGGER: Notify Student about Feedback
    await sendEmail(recipientId, 'systemNotification', {
        title: 'New Feedback on Task',
        message: `Supervisor ${req.user.name} added instructions to your task: "${task.title}". Feedback: ${feedback}`
    });

    res.status(200).json({ message: "Feedback saved and notification sent!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ==========================================
 * SUBMISSIONS & GRADING
 * ==========================================
 */

const submitDeliverable = asyncHandler(async (req, res) => {
    const { deadlineId, title } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) { res.status(404); throw new Error('Project not found'); }
    
    let deadline = null;
    if (deadlineId && deadlineId !== 'null' && deadlineId !== 'undefined') {
        deadline = await Deadline.findById(deadlineId);
    }

    const newSubmission = {
      deadlineId: deadline ? deadline._id : undefined,
      title: title || deadline?.title || "General Resource", 
      fileUrl: req.file.secure_url || req.file.path,
      submittedAt: new Date(),
      status: deadline ? 'Submitted' : 'Resource' 
    };
  
    project.submissions.push(newSubmission);
    await project.save();

    // ✅ NOTIFY SUPERVISOR: In-app
    if (project.supervisor) {
        await Notification.create({
            recipient: project.supervisor,
            sender: req.user._id,
            title: "New Deliverable Submitted",
            message: `The group for "${project.title}" has submitted: ${newSubmission.title}`,
            type: 'System',
            link: `/projects/${project._id}`
        });

        // ✅ 📧 EMAIL TRIGGER: Notify Supervisor about File Upload
        await sendEmail(project.supervisor, 'systemNotification', {
            title: 'New File Submission',
            message: `Team "${project.title}" has uploaded a new document for your review: "${newSubmission.title}".`
        });
    }

    res.json({ message: `File Uploaded successfully`, submission: newSubmission });
});

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

    // ✅ NOTIFY STUDENTS: In-app
    const teamMembers = [project.leader, ...(project.members || [])].filter(Boolean);
    const notificationPromises = teamMembers.map(memberId => 
        Notification.create({
            recipient: memberId,
            sender: req.user._id,
            title: 'Submission Graded',
            message: `Your submission "${submission.title}" has been graded! Marks: ${marks}`,
            type: 'Grade',
            link: `/projects/${project._id}`
        })
    );
    await Promise.all(notificationPromises);

    // ✅ 📧 EMAIL TRIGGER: Notify Team about Grade/Feedback
    await sendProjectEmails(project._id, 'gradeNotification', {
        projectName: project.title,
        grade: marks,
        feedback: feedback || 'No feedback provided.'
    });

    res.json({ message: 'Grade updated successfully', project });
});

const submitForReview = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);
    if (!project) { res.status(404); throw new Error('Project not found'); }

    project.status = 'Pending Evaluation';
    await project.save();

    // ✅ 📧 EMAIL TRIGGER: Notify Supervisor of Final Submission
    if (project.supervisor) {
        await sendEmail(project.supervisor, 'systemNotification', {
            title: 'Final Project Submission',
            message: `The project "${project.title}" has been submitted for final evaluation. Please post the final score and feedback.`
        });
    }

    res.json({ message: 'Project submitted for final review successfully', project });
});

const requestRevision = asyncHandler(async (req, res) => {
    const { feedback } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) { res.status(404); throw new Error('Project not found'); }

    project.status = 'Revision Requested';
    await project.save();

    // ✅ 📧 EMAIL TRIGGER: Notify Students of Revision
    await sendProjectEmails(project._id, 'systemNotification', {
        projectName: project.title,
        message: `Your supervisor has requested revisions on your submission. Feedback: ${feedback}`
    });

    res.json({ message: 'Revision request sent successfully', project });
});

const gradeProject = asyncHandler(async (req, res) => {
    const { score, feedback } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) { res.status(404); throw new Error('Project not found'); }

    project.grade = {
        score: Number(score),
        feedback: feedback.trim(),
        gradedBy: req.user._id,
        gradedAt: Date.now()
    };

    project.status = 'Completed';
    await project.save();

    // ✅ 📧 EMAIL TRIGGER: Final Project Grading
    await sendProjectEmails(project._id, 'gradeNotification', {
        projectName: project.title,
        grade: score,
        feedback: feedback
    });

    res.json({ message: 'Project graded successfully', project });
});
// @desc    Get dashboard data for a supervisor
// @route   GET /api/projects/supervisor/dashboard
// @access  Private/Supervisor
const getSupervisorDashboard = asyncHandler(async (req, res) => {
    // 1. Find projects where this user is the assigned supervisor
    const activeProjects = await Project.find({ 
        supervisor: req.user._id, 
        status: { $in: ['Ongoing', 'Approved', 'Completed', 'Pending Evaluation', 'Revision Requested'] } 
    })
    .populate('leader members', 'name email rollNo profilePicture')
    .sort({ updatedAt: -1 });

    // 2. Find pending supervision requests sent to this teacher
    const pendingRequests = await Project.find({ 
        supervisionRequests: { 
            $elemMatch: { 
                teacherId: req.user._id, 
                requestStatus: 'Sent' 
            } 
        } 
    })
    .populate('leader members', 'name email rollNo profilePicture');

    res.json({ activeProjects, pendingRequests });
});
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
    addTaskFeedback, 
    gradeProject, 
    submitForReview, 
    requestRevision 
};