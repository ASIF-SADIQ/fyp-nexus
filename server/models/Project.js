const mongoose = require('mongoose');

// ✅ TASK SCHEMA: Updated to allow unassigned AI tasks and Supervisor Feedback
const taskSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  // If null, it shows the "Claim" button in the frontend
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null 
  }, 
  status: { 
    type: String, 
    enum: ['To Do', 'In Progress', 'Done'], 
    default: 'To Do' 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    default: 'Medium' 
  },
  dueDate: { type: Date },
  
  // 🌟 ADDED: This allows Mongoose to save Supervisor Notes to the database
  feedback: {
    type: String,
    default: ''
  }
}, { timestamps: true });

const projectSchema = new mongoose.Schema(
  {
    // --- BASIC INFO ---
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true
    },
    description: {
      type: String,
      required: [true, "Project description is required"]
    },
    technologies: {
      type: String,
      default: "" 
    },
    domain: {
      type: String,
      required: [true, "Project domain is required"]
    },
    proposalDocument: {
      type: String,
      required: [true, "Proposal PDF URL is required"]
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    department: {
      type: String,
      default: "General",
      required: true 
    },

    // --- 🚀 SUPERVISION & FEEDBACK ---
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    supervisionRequests: [
      {
        teacherId: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'User', 
          required: true 
        },
        requestStatus: { 
          type: String, 
          enum: ['Sent', 'Accepted', 'Rejected'], 
          default: 'Sent' 
        },
        requestDate: { 
          type: Date, 
          default: Date.now 
        }
      }
    ],

    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Ongoing', 'Completed'],
      default: 'Pending'
    },

    // --- 🚀 DEADLINE MANAGEMENT ---
    deadlineOverrides: [
      {
        deadlineId: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'Deadline' 
        },
        newDate: { type: Date, required: true },
        reason: { type: String, default: "Admin Extension" }
      }
    ],

    // --- 🚀 DYNAMIC DELIVERABLES & SUBMISSIONS ---
    submissions: [
      {
        deadlineId: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'Deadline',
          required: true 
        },
        title: { type: String, required: true }, 
        fileUrl: { type: String, required: true },
        status: { 
          type: String, 
          enum: ['Pending', 'Submitted', 'Late', 'Approved', 'Revision'], 
          default: 'Submitted' 
        },
        feedback: { type: String, default: "" },
        marks: { type: Number, default: null },
        gradedAt: { type: Date },
        submittedAt: { type: Date, default: Date.now }
      }
    ],

    // --- 🚀 AI & ROADMAP MANAGEMENT ---
    
    // Stores the AI-generated timeline phases
    roadmap: [
      {
        phase: { type: String, required: true }, 
        description: { type: String }, // Stores the date range (e.g., "Jan 1 - Jan 15")
        status: { 
          type: String, 
          enum: ['Pending', 'In Progress', 'Completed'], 
          default: 'Pending' 
        }
      }
    ],

    // Individual Contribution Snapshot for Supervisor/Leader Dashboards
    memberProgress: [
      {
        memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        percentage: { type: Number, default: 0 },
        tasksDone: { type: Number, default: 0 },
        totalTasksAssigned: { type: Number, default: 0 }
      }
    ],

    // --- 🚀 TASK MANAGEMENT ---
    tasks: [taskSchema],

    comments: [
      {
        from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        date: { type: Date, default: Date.now }
      }
    ],

    adminFeedback: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for leader data
projectSchema.virtual('leaderData', {
  ref: 'User',
  localField: 'leader',
  foreignField: '_id',
  justOne: true
});

// Index for faster dashboard querying
projectSchema.index({ 'supervisionRequests.teacherId': 1, 'supervisionRequests.requestStatus': 1 });
projectSchema.index({ supervisor: 1 }); // Added for faster Supervisor project list loading

module.exports = mongoose.model('Project', projectSchema);