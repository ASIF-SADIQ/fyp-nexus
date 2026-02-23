const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');

// ✅ UPDATE: Added 'supervisor' to the middleware imports
const { protect, admin, supervisor } = require('../middleware/authMiddleware'); 
const { registerUser, loginUser } = require('../controllers/authController');
const User = require('../models/User');
const Project = require('../models/Project'); // ✅ REQUIRED for workload calculation

// --- 1. AUTH ROUTES ---
router.post('/register', registerUser);
router.post('/login', loginUser);

/**
 * @desc    Get all users (Search + Filter)
 */
router.get('/', protect, asyncHandler(async (req, res) => {
    const { search, department, role } = req.query;
    let query = { _id: { $ne: req.user._id } };

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { rollNo: { $regex: search, $options: 'i' } }
        ];
    }

    if (department && department !== 'All') query.department = department;
    if (role && role !== 'All') query.role = role;

    const users = await User.find(query).select('-password');
    res.json(users);
}));

/**
 * @desc    Get Supervisors with REAL-TIME Workload (Fixes 6/5 vs 2/5)
 * ✅ NEW ROUTE: Must be placed BEFORE any dynamic /:id routes
 */
router.get('/supervisors', protect, asyncHandler(async (req, res) => {
    // This aggregation pipeline calculates the exact number of active projects
    // directly from the Projects collection, ignoring any stale data in the User model.
    const supervisors = await User.aggregate([
        { 
            $match: { role: 'supervisor' } 
        },
        {
            $lookup: {
                from: 'projects', // Matches your DB collection name
                let: { supervisorId: '$_id' },
                pipeline: [
                    { 
                        $match: { 
                            $expr: { $eq: ['$supervisor', '$$supervisorId'] },
                            status: 'Ongoing' 
                        } 
                    }
                ],
                as: 'activeProjectsList'
            }
        },
        {
            $addFields: {
                realTimeLoad: { $size: '$activeProjectsList' } // ✅ Calculates the '6'
            }
        },
        {
            $project: {
                name: 1,
                department: 1,
                profilePicture: 1,
                expertise: 1,
                maxProjects: 1, // ✅ Fetches the '5'
                currentProjectsCount: '$realTimeLoad' // ✅ Overwrites with real count
            }
        }
    ]);

    res.json(supervisors);
}));

/**
 * @desc    Get current user profile
 */
router.get('/me', protect, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    res.json(user);
}));

/**
 * @desc    Update own profile (Student/Teacher Portfolio)
 */
router.put('/profile', protect, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.department) user.department = req.body.department;
    if (req.body.bio !== undefined) user.bio = req.body.bio;
    if (req.body.githubUrl !== undefined) user.githubUrl = req.body.githubUrl;
    if (req.body.linkedinUrl !== undefined) user.linkedinUrl = req.body.linkedinUrl;
    if (req.body.portfolioUrl !== undefined) user.portfolioUrl = req.body.portfolioUrl;
    if (req.body.profilePicture !== undefined) user.profilePicture = req.body.profilePicture;

    if (req.body.skills) {
        user.skills = Array.isArray(req.body.skills) ? req.body.skills : user.skills;
    }

    if (req.body.expertise) {
        user.expertise = Array.isArray(req.body.expertise) ? req.body.expertise : user.expertise;
    }

    if (req.body.password && req.body.password.trim() !== '') {
        user.password = req.body.password;
    }

    try {
        const updatedUser = await user.save();
        
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            department: updatedUser.department,
            rollNo: updatedUser.rollNo,
            bio: updatedUser.bio,
            skills: updatedUser.skills,
            githubUrl: updatedUser.githubUrl,
            linkedinUrl: updatedUser.linkedinUrl,
            portfolioUrl: updatedUser.portfolioUrl,
            profilePicture: updatedUser.profilePicture,
            expertise: updatedUser.expertise
        });
    } catch (error) {
        console.error("CRITICAL SAVE ERROR:", error.message);
        res.status(400).json({ 
            message: "Database Save Failed: " + error.message 
        });
    }
}));

// --- ADMIN ROUTES REMAIN UNCHANGED ---

router.put('/:id', protect, admin, asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    if (req.body.name) user.name = req.body.name;
    if (req.body.department) user.department = req.body.department;
    if (req.body.batch) user.batch = req.body.batch;
    if (req.body.rollNo) user.rollNo = req.body.rollNo;
    if (req.body.maxProjects !== undefined) user.maxProjects = req.body.maxProjects;
    if (req.body.bio !== undefined) user.bio = req.body.bio;
    if (req.body.githubUrl !== undefined) user.githubUrl = req.body.githubUrl;
    if (req.body.password && req.body.password.trim() !== '') {
        user.password = req.body.password;
    }
    await user.save();
    res.json(user);
}));

router.put('/reset-password/:id', protect, admin, asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    user.password = 'Nexus@123';
    await user.save();
    res.json({ message: 'Password reset to default (Nexus@123)' });
}));

router.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    await user.deleteOne();
    res.json({ message: 'User removed from Nexus' });
}));

module.exports = router;