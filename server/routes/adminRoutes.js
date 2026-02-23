const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Project = require('../models/Project');
const { protect, admin } = require('../middleware/authMiddleware');

// --- HELPER: CAPACITY CHECK (INTERNAL) ---
// ✅ Expert Logic: Re-calculates active project count to prevent over-assignment
const checkSupervisorCapacity = async (supervisorId) => {
    const supervisor = await User.findById(supervisorId);
    if (!supervisor) return { isFull: true, message: "Supervisor not found." };

    const activeProjects = await Project.countDocuments({
        supervisor: supervisorId,
        status: { $in: ['Approved', 'Ongoing'] }
    });

    const limit = supervisor.maxProjects || 5;
    return {
        isFull: activeProjects >= limit,
        current: activeProjects,
        limit: limit,
        name: supervisor.name
    };
};

// --- 1. GET ALL SUPERVISORS ---
router.get('/supervisors', protect, admin, asyncHandler(async (req, res) => {
    console.log('[GET /admin/supervisors] → Fetching all supervisors');
    const supervisors = await User.find({ role: 'supervisor' }).select('-password');
    res.json(supervisors);
}));

// --- 2. GET PROJECTS (SYNCED WITH LEADER & STUDENT SCHEMA) ---
router.get('/projects', protect, admin, asyncHandler(async (req, res) => {
    console.log('[GET /admin/projects] → Fetching all projects');
    const projects = await Project.find()
        .populate('leader', 'name email rollNo department')
        .populate('student', 'name email rollNo department')
        .populate('members', 'name rollNo')
        .populate('supervisor', 'name email department')
        .sort({ createdAt: -1 });
    res.json(projects);
}));

// --- 3. ADD USER MANUALLY ---
router.post('/add-user', protect, admin, asyncHandler(async (req, res) => {
    const { name, email, role, department, expertise, maxProjects, password, rollNo, batch } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
        name,
        email,
        role,
        rollNo,
        batch: role === 'student' ? batch : null,
        department: department || req.user?.department,
        password,
        expertise: role === 'supervisor' ? (Array.isArray(expertise) ? expertise : [expertise]) : [],
        maxProjects: role === 'supervisor' ? (maxProjects || 5) : 0
    });

    await newUser.save();
    res.status(201).json({ message: `${role} registered successfully!` });
}));

// --- 4. UPDATE USER (WITH CHANGE DETECTION) ---
router.put('/:id', protect, admin, asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let hasChanges = false;

    // Standard Fields
    ['name', 'email', 'department', 'role'].forEach(field => {
        if (req.body[field] && req.body[field].trim() !== String(user[field] || '').trim()) {
            user[field] = req.body[field].trim();
            hasChanges = true;
        }
    });

    // Role Specifics
    if (user.role === 'student') {
        if (req.body.rollNo && req.body.rollNo !== user.rollNo) { user.rollNo = req.body.rollNo; hasChanges = true; }
        if (req.body.batch && req.body.batch !== user.batch) { user.batch = req.body.batch; hasChanges = true; }
    }

    if (user.role === 'supervisor') {
        if (req.body.expertise) {
            const newExp = Array.isArray(req.body.expertise) ? req.body.expertise : [req.body.expertise];
            user.expertise = newExp;
            hasChanges = true;
        }
        if (req.body.maxProjects !== undefined) {
            user.maxProjects = Number(req.body.maxProjects);
            hasChanges = true;
        }
    }

    if (req.body.password) {
        user.password = req.body.password;
        hasChanges = true;
    }

    if (!hasChanges) return res.json({ message: 'No changes detected', user });

    const updatedUser = await user.save();
    res.json({ message: 'User updated successfully', user: updatedUser });
}));

// --- 5. ASSIGN SUPERVISOR (WITH CAPACITY GUARD) ---
// ✅ Rule: Admin can assign, but system blocks if supervisor is full
router.put('/assign-supervisor', protect, admin, asyncHandler(async (req, res) => {
    const { projectId, supervisorId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // 🛡️ CAPACITY GUARD
    const capacity = await checkSupervisorCapacity(supervisorId);
    if (capacity.isFull) {
        res.status(400);
        throw new Error(`Assignment Failed: ${capacity.name} has reached the limit of ${capacity.limit} projects.`);
    }

    // Update Project State
    project.supervisor = supervisorId;
    project.status = 'Ongoing'; // Move to Ongoing now that a teacher is assigned
    
    // Sync request object for consistency
    project.supervisionRequest = {
        teacherId: supervisorId,
        requestStatus: 'Accepted',
        requestDate: Date.now()
    };

    await project.save();
    console.log(`[ASSIGN] Project ${projectId} assigned to ${capacity.name}`);

    res.json({ message: 'Supervisor assigned and project moved to Ongoing!', project });
}));

// --- 6. GET DASHBOARD STATS ---
router.get('/stats', protect, admin, asyncHandler(async (req, res) => {
    const [students, teachers, projectsCount] = await Promise.all([
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'supervisor' }),
        Project.countDocuments()
    ]);

    res.json({
        counts: {
            students,
            teachers,
            projects: projectsCount
        }
    });
}));

module.exports = router;