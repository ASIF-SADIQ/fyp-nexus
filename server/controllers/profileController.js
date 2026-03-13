const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Get user profile setup status
// @route   GET /api/profile/setup-status
// @access  Private
const getProfileSetupStatus = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('profileSetupComplete personalEmail phoneNumber emailPreferences');
    
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    res.json({
        profileSetupComplete: user.profileSetupComplete,
        personalEmail: user.personalEmail || '',
        phoneNumber: user.phoneNumber || '',
        emailPreferences: user.emailPreferences
    });
});

// @desc    Complete user profile setup
// @route   POST /api/profile/setup
// @access  Private
const completeProfileSetup = asyncHandler(async (req, res) => {
    const { personalEmail, phoneNumber, emailPreferences } = req.body;

    console.log('🔍 PROFILE SETUP START:', req.user.id);

    const user = await User.findById(req.user.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // 1. Validate Personal Email Uniqueness
    if (personalEmail) {
        const normalizedEmail = personalEmail.toLowerCase().trim();
        const existingUser = await User.findOne({ 
            personalEmail: normalizedEmail, 
            _id: { $ne: user._id } 
        });
        
        if (existingUser) {
            console.log('❌ SETUP ERROR: Email already in use by', existingUser.name);
            res.status(400);
            throw new Error('This personal email is already registered to another user');
        }
        user.personalEmail = normalizedEmail;
    }

    // 2. Update Basic Info
    if (phoneNumber) user.phoneNumber = phoneNumber;

    // 3. Update Email Preferences (Merge with defaults)
    if (emailPreferences) {
        user.emailPreferences = {
            ...user.emailPreferences,
            ...emailPreferences
        };
    }

    // 4. Set Flag to True
    user.profileSetupComplete = true;

    try {
        await user.save();
        console.log('✅ SETUP SUCCESS: Profile unlocked for', user.name);
        
        res.json({
            message: 'Profile setup completed successfully',
            profileSetupComplete: true,
            personalEmail: user.personalEmail,
            emailPreferences: user.emailPreferences
        });
    } catch (error) {
        console.error('❌ SAVE ERROR:', error.message);
        res.status(400);
        throw new Error(`Failed to save setup: ${error.message}`);
    }
});

// @desc    Get full user profile for editing
// @route   GET /api/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    res.json(user);
});

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const {
        name,
        personalEmail,
        phoneNumber,
        bio,
        skills,
        githubUrl,
        linkedinUrl,
        portfolioUrl,
        expertise,
        links // Just in case you use a "links" object for social
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Email Uniqueness Check for Updates
    if (personalEmail && personalEmail !== user.personalEmail) {
        const normalizedEmail = personalEmail.toLowerCase().trim();
        const existingUser = await User.findOne({ 
            personalEmail: normalizedEmail, 
            _id: { $ne: user._id } 
        });
        if (existingUser) {
            res.status(400);
            throw new Error('This email is already in use');
        }
        user.personalEmail = normalizedEmail;
    }

    // Dynamic Field Updates
    if (name) user.name = name;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio) user.bio = bio;
    if (skills) user.skills = skills;
    if (githubUrl) user.githubUrl = githubUrl;
    if (linkedinUrl) user.linkedinUrl = linkedinUrl;
    if (portfolioUrl) user.portfolioUrl = portfolioUrl;
    
    // Role-specific fields
    if (expertise && user.role === 'supervisor') user.expertise = expertise;

    await user.save();

    res.json({
        message: 'Profile updated successfully',
        user: {
            name: user.name,
            personalEmail: user.personalEmail,
            profileSetupComplete: user.profileSetupComplete,
            role: user.role
        }
    });
});

// @desc    Update specific email preferences
// @route   PUT /api/profile/email-preferences
// @access  Private
const updateEmailPreferences = asyncHandler(async (req, res) => {
    const { emailPreferences } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.emailPreferences = {
        ...user.emailPreferences,
        ...emailPreferences
    };

    await user.save();

    res.json({
        message: 'Email preferences updated successfully',
        emailPreferences: user.emailPreferences
    });
});

module.exports = {
    getProfileSetupStatus,
    completeProfileSetup,
    updateEmailPreferences,
    getUserProfile,
    updateUserProfile
};