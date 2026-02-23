const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Middleware
const { protect, admin } = require('../middleware/authMiddleware');

// Controllers
const {
  getProjects,
  getProjectById,
  createProject,
  updateProjectStatus,
  requestSupervisor,
  respondToRequest,
  getMyProjects,
  getSupervisorDashboard,
  submitDeliverable,
  gradeSubmission,
  addTask,
  claimTask,
  updateTaskStatus,
  addTaskFeedback // This is imported directly
} = require('../controllers/projectController');

// -------------------------------
// 1️⃣ CLOUDINARY CONFIG
// -------------------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

// -------------------------------
// 2️⃣ STORAGE ENGINE
// -------------------------------
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'fyp_nexus_proposals',
    resource_type: 'raw',
    format: 'pdf',
    public_id: (req, file) => `doc-${Date.now()}`
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// =====================================================
// 🔥 ROUTES ORDERED CORRECTLY
// =====================================================

// -------------------------------
// 🌟 TASK FEEDBACK (MUST BE AT THE TOP)
// -------------------------------
// Fixed: Using 'addTaskFeedback' directly because it was imported as such
router.patch('/:id/tasks/:taskId/feedback', protect, addTaskFeedback);

// -------------------------------
// 📊 DASHBOARD & SPECIAL ROUTES
// -------------------------------
router.get('/my', protect, getMyProjects);
router.get('/supervisor/dashboard', protect, getSupervisorDashboard);

// -------------------------------
// 📋 BASIC PROJECT ROUTES
// -------------------------------
router.get('/', protect, admin, getProjects);
router.post('/', protect, upload.single('proposalDocument'), createProject);
router.get('/:id', protect, getProjectById);
router.put('/:id/status', protect, admin, updateProjectStatus);

// -------------------------------
// 🎓 SUPERVISION WORKFLOW
// -------------------------------
router.put('/:id/request-supervisor', protect, requestSupervisor);
router.put('/:id/respond-request', protect, respondToRequest);

// -------------------------------
// 📂 DELIVERABLES & GRADING
// -------------------------------
router.post('/:id/submit', protect, upload.single('file'), submitDeliverable);
router.put('/:id/grade', protect, gradeSubmission);

// -------------------------------
// 📋 TASK MANAGEMENT
// -------------------------------
router.post('/:id/tasks', protect, addTask);
router.patch('/:id/tasks/:taskId/claim', protect, claimTask);
router.patch('/:id/tasks/:taskId', protect, updateTaskStatus);

module.exports = router;