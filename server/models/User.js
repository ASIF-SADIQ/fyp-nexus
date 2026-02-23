const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    // --- CORE AUTH FIELDS ---
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,           
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: [6, "Password must be at least 6 characters"]
    },
    role: {
      type: String,
      required: true,
      enum: ['student', 'supervisor', 'admin'], 
      default: 'student'
    },

    // --- UNIVERSITY IDENTIFICATION ---
    rollNo: {
      type: String,
      unique: true,
      sparse: true,            
      uppercase: true,
      trim: true
    },
    department: {
      type: String,
      required: [true, "Department assignment is required"],
      trim: true
    },
    batch: {
      type: String             
    },

    // --- 🚀 PORTFOLIO & SOCIALS ---
    bio: {
      type: String,
      default: "",
      maxLength: [500, "Bio cannot exceed 500 characters"]
    },
    skills: [{ 
      type: String,
      trim: true
    }],
    githubUrl: {
      type: String,
      default: "",
      trim: true
    },
    linkedinUrl: {
      type: String,
      default: "",
      trim: true
    },
    portfolioUrl: {
      type: String,
      default: "",
      trim: true
    },

    // --- PROJECT TRACKING FIELDS ---
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null
    },
    hasProject: {
      type: Boolean,
      default: false          
    },
    isLeader: {
      type: Boolean,
      default: false          
    },

    // --- TEACHER SPECIFIC FIELDS ---
    expertise: [{
      type: String            
    }],
    maxProjects: {
      type: Number,
      default: 3               
    },
    currentProjectsCount: {
      type: Number,
      default: 0
    },

    // --- PROFILE CUSTOMIZATION ---
    profilePicture: {
      type: String,
      default: ""              
    }
  },
  {
    timestamps: true,
  }
);

// --- METHODS ---

// Compare password for login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// --- MIDDLEWARE (PRE-SAVE) ---

/**
 * AUTO-HASH PASSWORD before saving
 * FIXED: Removed 'next' parameter to solve "next is not a function" error.
 * In Mongoose async hooks, returning or resolving completes the middleware.
 */

userSchema.pre('save', async function () {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return; // Just exit the function to continue the save process
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    // This will be caught by the 'CRITICAL SAVE ERROR' catch block in your route
    throw new Error(error);
  }
});

module.exports = mongoose.model('User', userSchema);