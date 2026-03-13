const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc    Get all notifications for logged in user
// @route   GET /api/notifications/my
// @access  Private
const getMyNotifications = asyncHandler(async (req, res) => {
    // 🛠️ DEBUG: Verify User ID in terminal
    console.log("🔍 NOTIFICATION FETCH: User ID ->", req.user?._id);

    if (!req.user || !req.user._id) {
        res.status(401);
        throw new Error('Not authorized, user ID missing');
    }

    // ✅ RECIPIENT: Match the field name in your Notification Schema
    // ✅ POPULATE: Get Sender's name and role so the UI looks professional
    const notifications = await Notification.find({ recipient: req.user._id })
        .populate('sender', 'name role profilePicture') 
        .sort({ createdAt: -1 }) // Newest on top
        .limit(30); // Keep it fast by limiting to last 30
    
    console.log(`✅ NOTIFICATION SUCCESS: Found ${notifications.length} records.`);
    
    res.status(200).json(notifications);
});

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        res.status(404);
        throw new Error('Notification not found');
    }

    // Security check: Only the owner can mark it read
    if (notification.recipient.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Unauthorized access to this notification');
    }

    notification.isRead = true;
    await notification.save();
    
    res.json({ success: true, notification });
});

// @desc    Mark ALL notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
    // ✅ UpdateMany is much faster for "Clear All" features
    const result = await Notification.updateMany(
        { recipient: req.user._id, isRead: false },
        { $set: { isRead: true } }
    );
    
    res.json({ 
        message: 'Notifications cleared', 
        updatedCount: result.modifiedCount 
    });
});

// @desc    Delete a notification (Optional: for cleaner UI)
// @route   DELETE /api/notifications/:id
const deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);
    
    if (notification && notification.recipient.toString() === req.user._id.toString()) {
        await notification.deleteOne();
        res.json({ message: 'Notification removed' });
    } else {
        res.status(404);
        throw new Error('Notification not found or unauthorized');
    }
});

module.exports = { 
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
};