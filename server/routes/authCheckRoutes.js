const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { checkProfileSetup } = require('../middleware/profileSetupMiddleware');
const User = require('../models/User');

/**
 * @desc    Check if user needs profile setup
 * @route   GET /api/auth/check-profile
 * @access  Private
 */
router.get('/check-profile', protect, checkProfileSetup, async (req, res) => {
  try {
    const profileInfo = req.profileInfo || {
      requiresSetup: true,
      requiresEmail: true,
      name: req.user.name,
      role: req.user.role
    };

    res.json({
      success: true,
      profileInfo,
      user: {
        name: req.user.name,
        role: req.user.role,
        email: req.user.email
      }
    });
  } catch (error) {
    console.error('Profile check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking profile status'
    });
  }
});

/**
 * @desc    Get profile setup status (for dashboard)
 * @route   GET /api/auth/profile-status
 * @access  Private
 */
router.get('/profile-status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('profileSetupComplete personalEmail name role email');
    
    res.json({
      success: true,
      profileComplete: user?.profileSetupComplete || false,
      hasPersonalEmail: !!user?.personalEmail,
      user: {
        name: user?.name || req.user.name,
        role: user?.role || req.user.role,
        email: user?.email || req.user.email
      }
    });
  } catch (error) {
    console.error('Profile status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting profile status'
    });
  }
});

module.exports = router;
