const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc    Get all notifications for logged in user
// @route   GET /api/notifications/my
const getMyNotifications = asyncHandler(async (req, res) => {
  // ✅ FIX: Changed 'receiver' to 'recipient' to match the database model
  // 🌟 ADDED: .populate() to automatically fetch the Supervisor's name and details
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate('sender', 'name email role') 
    .sort({ createdAt: -1 }) // Show newest first
    .limit(50);
  
  res.status(200).json(notifications);
});

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  // Ensure only the recipient can mark it as read
  if (notification.recipient.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  notification.isRead = true;
  await notification.save();
  
  res.json({ message: 'Marked as read' });
});

// @desc    Mark ALL notifications as read
// @route   PUT /api/notifications/read-all
const markAllAsRead = asyncHandler(async (req, res) => {
  // ✅ FIX: Changed 'receiver' to 'recipient'
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );
  
  res.json({ message: 'All notifications marked as read' });
});

module.exports = { 
  getMyNotifications,
  markAsRead,
  markAllAsRead
};