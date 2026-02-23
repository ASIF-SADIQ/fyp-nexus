const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  getMyNotifications, 
  markAsRead, 
  markAllAsRead 
} = require('../controllers/notificationController');

router.get('/my', protect, getMyNotifications);
router.put('/read-all', protect, markAllAsRead); // Must go BEFORE /:id/read
router.put('/:id/read', protect, markAsRead);

module.exports = router;