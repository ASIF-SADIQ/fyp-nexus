const User = require('../models/User');
const asyncHandler = require('express-async-handler');

/**
 * @desc    Middleware to ensure user has completed profile setup
 * @route   Protected routes
 * @access  Private
 */
const requireProfileSetup = asyncHandler(async (req, res, next) => {
  try {
    // Get user from the auth middleware (req.user should be set by protect middleware)
    const user = await User.findById(req.user._id).select('profileSetupComplete personalEmail name role');
    
    if (!user) {
      res.status(401);
      throw new Error('User not found');
    }

    // Check if profile setup is complete
    if (!user.profileSetupComplete) {
      // Return profile setup required response
      res.status(422).json({
        success: false,
        message: 'Profile setup required',
        requiresProfileSetup: true,
        user: {
          name: user.name,
          role: user.role,
          profileSetupComplete: user.profileSetupComplete
        },
        nextStep: '/profile-setup'
      });
      return;
    }

    // Check if personal email is provided
    if (!user.personalEmail) {
      res.status(422).json({
        success: false,
        message: 'Personal email required for notifications',
        requiresEmailSetup: true,
        user: {
          name: user.name,
          role: user.role,
          profileSetupComplete: user.profileSetupComplete
        },
        nextStep: '/profile-setup'
      });
      return;
    }

    // Profile is complete, proceed to next middleware/route
    next();
    
  } catch (error) {
    console.error('Profile setup middleware error:', error);
    
    if (res.statusCode === 422) {
      // We've already sent the response, don't send another
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Error checking profile setup',
      error: error.message
    });
  }
});

/**
 * @desc    Middleware to check if user needs profile setup (non-blocking)
 * @route   Dashboard routes
 * @access  Private
 */
const checkProfileSetup = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('profileSetupComplete personalEmail name role');
    
    if (!user) {
      return next();
    }

    // Attach profile info to request object for frontend to use
    req.profileInfo = {
      requiresSetup: !user.profileSetupComplete,
      requiresEmail: !user.personalEmail,
      name: user.name,
      role: user.role
    };

    next();
    
  } catch (error) {
    console.error('Profile check middleware error:', error);
    // Don't block the request, just continue
    next();
  }
});

module.exports = {
  requireProfileSetup,
  checkProfileSetup
};
