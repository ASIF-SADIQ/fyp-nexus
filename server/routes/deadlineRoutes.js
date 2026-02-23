const express = require('express');
const router = express.Router();
const { 
  createDeadline, 
  getStudentDeadlines, 
  getProjectRoadmap, 
  getAllDeadlines, 
  deleteDeadline 
} = require('../controllers/deadlineController');
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * @desc    Get deadlines for logged-in student (Admin Global + Batch + Group Tasks)
 * @route   GET /api/deadlines/my
 */
router.get('/my', protect, getStudentDeadlines);

/**
 * @desc    Supervisor/Admin: Get roadmap for a specific project
 * @route   GET /api/deadlines/project/:projectId
 */
router.get('/project/:projectId', protect, getProjectRoadmap);

/**
 * @desc    Admin/Supervisor: Get all deadlines
 * @desc    Admin/Supervisor: Create new deadlines
 * @route   GET /api/deadlines
 * @route   POST /api/deadlines
 */
router.route('/')
  /** * ✅ MODIFIED: Removed 'admin' middleware.
   * Supervisors need access to this to view the roadmap and their own created tasks.
   */
  .get(protect, getAllDeadlines)
  .post(protect, createDeadline); 

/**
 * @desc    Admin/Supervisor: Delete a deadline
 * @route   DELETE /api/deadlines/:id
 * ✅ MODIFIED: Removed 'admin' middleware.
 * Both roles can access the endpoint; the controller logic verifies if 
 * the user is an Admin OR the original creator of the task.
 */
router.delete('/:id', protect, deleteDeadline);

module.exports = router;