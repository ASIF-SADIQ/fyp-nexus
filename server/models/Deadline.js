const mongoose = require('mongoose');

const deadlineSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Deadline title is required"],
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    deadlineDate: {
      type: Date,
      required: [true, "A valid date and time is required"]
    },
    // ✅ SCOPE LOGIC: Determines who sees this deadline
    scope: { 
      type: String, 
      enum: ['Global', 'Batch', 'Group'], 
      default: 'Batch',
      required: true 
    },
    // Required if scope is 'Batch'
    batch: {
      type: String, 
      required: function() { return this.scope === 'Batch'; }
    },
    // Required if scope is 'Batch'
    department: {
      type: String,
      required: function() { return this.scope === 'Batch'; }
    },
    // ✅ TARGET PROJECT: Required only if scope is 'Group' (Supervisor specific)
    targetProject: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Project',
      required: function() { return this.scope === 'Group'; }
    },
    // ✅ CREATOR: Track who set the deadline (Admin or Supervisor)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['Document', 'Event', 'Task'], 
      default: 'Document'
    },
    isHardDeadline: { 
      type: Boolean, 
      default: true 
    }
  },
  {
    timestamps: true,
  }
);

// Optimized Indexing: 
// We index batch/dept for students and targetProject for group-specific lookups
deadlineSchema.index({ batch: 1, department: 1, scope: 1 });
deadlineSchema.index({ targetProject: 1, scope: 1 });

module.exports = mongoose.model('Deadline', deadlineSchema);