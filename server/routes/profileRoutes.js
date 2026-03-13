const express = require('express');
const router = express.Router();
const {
  getProfileSetupStatus,
  completeProfileSetup,
  updateEmailPreferences,
  getUserProfile,
  updateUserProfile
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

// Apply protection to all routes
router.use(protect);

// Profile setup routes
router.get('/setup-status', getProfileSetupStatus);
router.post('/setup', completeProfileSetup);

// Profile management routes
router.get('/', getUserProfile);
router.put('/', updateUserProfile);

// Email preferences
router.put('/email-preferences', updateEmailPreferences);

module.exports = router;
