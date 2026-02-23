const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // ✅ Renamed 'receiver' to 'recipient' to match standard conventions
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // ✅ ADDED: Title for bold headers in the UI
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  // ✅ UPDATED: Enums to cover all new features (Grading, Tasks, etc.)
  type: {
    type: String,
    enum: ['System', 'Feedback', 'Grade', 'Deadline', 'Task', 'Approval', 'Rejection'], 
    default: 'System'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  // ✅ ADDED: Navigation support
  link: { 
    type: String, 
    default: "" // e.g., "/dashboard" or "/projects/123"
  },
  relatedId: { 
    type: mongoose.Schema.Types.ObjectId // Optional: ID of the Project/Task/Submission
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);