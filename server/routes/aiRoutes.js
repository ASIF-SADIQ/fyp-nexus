const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Import all three AI-related functions
const { 
  generateProposal, 
  generateRoadmap, 
  applyRoadmap ,
  chatRoadmap
} = require('../controllers/aiController');

// 1. Proposal Generator (Generates the text for the proposal)
router.post('/proposal', protect, generateProposal);

// 2. Roadmap Generator (Generates the JSON timeline)
router.post('/roadmap', protect, generateRoadmap);

// 3. Roadmap Application (Saves the generated JSON to MongoDB)
// This is the route the "Apply to Project" button will call
router.post('/apply-roadmap', protect, applyRoadmap);
// Add this line below your other routes
router.post('/chat-roadmap', protect, chatRoadmap);

module.exports = router;