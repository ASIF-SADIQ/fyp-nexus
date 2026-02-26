const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['System', 'Feedback', 'Grade', 'Deadline', 'Task', 'Approval', 'Rejection'], 
    default: 'System'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  link: { 
    type: String, 
    default: "" 
  },
  relatedId: { 
    type: mongoose.Schema.Types.ObjectId 
  }
}, { timestamps: true });

// ✅ ADDED: Indexing for faster queries when fetching a user's unread notifications
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 }); // Helps sort by newest quickly

module.exports = mongoose.model('Notification', notificationSchema);