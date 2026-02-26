const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Project = require('../models/Project');
const User = require('../models/User');
const Deadline = require('../models/Deadline');
const Notification = require('../models/Notification');

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

    // ✅ NOTIFY ADMINS: When a student submits a proposal
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

    // ✅ NOTIFY STUDENTS: When admin approves/rejects proposal
    if (status && status !== previousStatus) {
        let notifTitle = 'Project Status Updated';
        let notifType = 'System';
        let notifMessage = `Your project "${project.title}" status changed to ${status}.`;

        if (status === 'Approved') {
            notifTitle = 'Proposal Approved!';
            notifType = 'Approval';
            notifMessage = `Great news! Your project proposal "${project.title}" has been approved.`;
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
    }

    res.json(project);
});

const requestSupervisor = asyncHandler(async (req, res) => {
    const { teacherId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) { res.status(404); throw new Error('Project not found'); }
    if (!teacherId) { res.status(400); throw new Error('Please select a supervisor'); }

    // Optional: Prevent sending duplicate requests to the same teacher
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
    
    // ✅ 1. Only push to the requests array. 
    project.supervisionRequests.push({ teacherId, requestStatus: 'Sent', requestDate: Date.now() });
    
    // ✅ 2. REMOVED: project.supervisor = teacherId; <-- This was causing the block!
    // ✅ 3. REMOVED: project.supervisorStatus = 'Pending'; <-- This too!
    
    await project.save();

    // ✅ NOTIFY SUPERVISOR: When student requests them
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
        notifMessage = `A supervisor has accepted your request for "${project.title}".`;
        notifType = 'Approval';
    } else {
        project.supervisionRequests[requestIndex].requestStatus = 'Rejected';
        project.supervisor = null;
        project.supervisorStatus = 'Rejected';
        
        notifTitle = 'Supervision Request Rejected';
        notifMessage = `Your supervision request for "${project.title}" was declined.`;
        notifType = 'Rejection';
    }

    await project.save();

    // ✅ NOTIFY STUDENTS: When Supervisor accepts/rejects the request
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

    if (!project) { res.status(404); throw new Error('Project not found'); }

    project.tasks.push({ title, assignedTo: assignedTo || null, priority: priority || 'Medium', dueDate, status: 'To Do' });
    await syncProjectProgress(project);
    await project.save();

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

    // ✅ NOTIFY STUDENT: Task feedback received
    const recipientId = task.assignedTo ? task.assignedTo : project.leader;
    const senderId = req.user ? req.user._id : null; 

    await Notification.create({
      recipient: recipientId,
      sender: senderId,
      title: "New Supervisor Feedback",
      message: `Your supervisor updated the instructions for: "${task.title}"`,
      type: "Feedback",
      link: `/projects/${project._id}`, 
      relatedId: project._id
    });

    res.status(200).json({ message: "Feedback saved and notification sent!" });
  } catch (error) {
    console.error("🔥 Controller Error:", error.message);
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
    
    if (!project) { 
        res.status(404); 
        throw new Error('Project not found'); 
    }
    
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

    // ✅ BROADCAST NOTIFICATIONS: File uploaded
    const uploaderId = req.user._id.toString();
    let recipients = [];

    if (project.supervisor) recipients.push(project.supervisor.toString());
    
    if (project.leader && project.leader.toString() !== uploaderId) {
        recipients.push(project.leader.toString());
    }
    
    if (project.members && project.members.length > 0) {
        project.members.forEach(memberId => {
            if (memberId.toString() !== uploaderId) {
                recipients.push(memberId.toString());
            }
        });
    }

    recipients = [...new Set(recipients)];

    const notifTitle = deadline 
        ? "New Deliverable Submitted" 
        : newSubmission.title; 

    const notifMessage = deadline 
        ? `The group for "${project.title}" submitted a deliverable for: ${deadline.title}`
        : `A new resource document was just shared in "${project.title}".`;

    if (recipients.length > 0) {
        const notificationPromises = recipients.map(recipientId => 
            Notification.create({
                recipient: recipientId,
                sender: req.user._id,
                title: notifTitle,
                message: notifMessage,
                type: 'System',
                link: `/projects/${project._id}`
            })
        );
        await Promise.all(notificationPromises);
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

    // ✅ NOTIFY STUDENTS: Specific submission graded
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

    res.json({ message: 'Grade updated successfully', project });
});

const getSupervisorDashboard = asyncHandler(async (req, res) => {
    const activeProjects = await Project.find({ supervisor: req.user._id, status: { $in: ['Ongoing', 'Approved', 'Completed', 'Pending Evaluation', 'Revision Requested'] } })
        .populate('leader members', 'name email rollNo profilePicture')
        .sort({ updatedAt: -1 });
    const pendingRequests = await Project.find({ supervisionRequests: { $elemMatch: { teacherId: req.user._id, requestStatus: 'Sent' } } })
        .populate('leader members', 'name email rollNo profilePicture');
    res.json({ activeProjects, pendingRequests });
});

const submitForReview = asyncHandler(async (req, res) => {
    const projectId = req.params.id;
    const userId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    const isMember = project.members?.some(member => member._id.toString() === userId.toString()) ||
                    project.leader?._id.toString() === userId.toString();
    
    if (!isMember) {
        res.status(403);
        throw new Error('Only project members can submit for review');
    }

    if (project.status === 'Pending Evaluation' || project.grade?.score) {
        res.status(400);
        throw new Error('Project is already submitted for review or has been graded');
    }

    project.status = 'Pending Evaluation';
    await project.save();

    // ✅ NOTIFY SUPERVISOR: Ready for final review
    if (project.supervisor) {
        await Notification.create({
            recipient: project.supervisor._id,
            sender: project.leader._id,
            title: 'Project Submitted for Review',
            message: `The group for "${project.title}" has submitted their project for final review!`,
            type: 'System',
            link: `/projects/${project._id}`
        });
    }

    res.json({
        message: 'Project submitted for final review successfully',
        project
    });
});

const requestRevision = asyncHandler(async (req, res) => {
    const projectId = req.params.id;
    const { feedback } = req.body;
    const userId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    if (!project.supervisor || project.supervisor._id.toString() !== userId.toString()) {
        res.status(403);
        throw new Error('Only the assigned supervisor can request revisions');
    }

    project.status = 'Revision Requested';
    await project.save();

    // ✅ NOTIFY STUDENTS: Revision requested
    const teamMembers = [project.leader, ...(project.members || [])].filter(Boolean);
    
    const notificationPromises = teamMembers.map(member => 
        Notification.create({
            recipient: member._id,
            sender: req.user._id,
            title: 'Revision Requested',
            message: `Supervisor requested revisions on your final submission: "${feedback}"`,
            type: 'Feedback',
            link: `/projects/${project._id}`
        })
    );

    await Promise.all(notificationPromises);

    res.json({ 
        message: 'Revision request sent successfully', 
        project
    });
});

const gradeProject = asyncHandler(async (req, res) => {
    const { score, feedback } = req.body;
    const projectId = req.params.id;

    if (!score || score < 0 || score > 100) {
        res.status(400);
        throw new Error('Score must be between 0 and 100');
    }

    if (!feedback || feedback.trim() === '') {
        res.status(400);
        throw new Error('Feedback is required');
    }

    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    project.grade = {
        score: Number(score),
        feedback: feedback.trim(),
        gradedBy: req.user._id,
        gradedAt: Date.now()
    };

    project.status = 'Completed';
    await project.save();

    // ✅ NOTIFY STUDENTS: Final project graded
    const teamMembers = [project.leader, ...(project.members || [])].filter(Boolean);
    const notificationPromises = teamMembers.map(member => 
      Notification.create({
        recipient: member._id,
        sender: req.user._id,
        title: 'Project Graded',
        message: `Your project has been officially graded and marked Completed! Check your dashboard.`,
        type: 'Grade',
        link: `/projects/${project._id}`
      })
    );

    await Promise.all(notificationPromises);

    res.json({
        message: 'Project graded successfully',
        project
    });
});

/**
 * ==========================================
 * EXPORTS
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
    addTaskFeedback, 
    gradeProject, 
    submitForReview, 
    requestRevision 
};