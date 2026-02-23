const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

// 1. Import Controller Functions
const { 
  registerUser, 
  loginUser, 
  getMe, 
  updateUserProfile, 
  getUsers, 
  deleteUser,
} = require('../controllers/authController'); 

// --- PUBLIC ROUTES ---
router.post('/register', registerUser);
router.post('/login', loginUser);

// --- PROTECTED ROUTES ---
// Get current user profile (Student/Teacher/Admin)
router.get('/me', protect, getMe);

// Update own profile
router.put('/profile', protect, updateUserProfile);

// --- SEARCH & DISCOVERY ---
// Find other users (e.g., searching for teammates)
router.get('/', protect, getUsers); 

// --- ADMIN SPECIFIC ROUTES ---
// Restricted to users where role === 'admin'
router.delete('/:id', protect, admin, deleteUser);

// ✅ Note: Admin User management (Add/Edit) should ideally 
// be handled in an adminController, but they can stay here 
// as long as they are protected by 'protect' and 'admin'.

module.exports = router;