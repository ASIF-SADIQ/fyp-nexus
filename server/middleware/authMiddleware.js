const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * ✅ 1. PROTECT ROUTE (Verify JWT)
 * Ensures the user is logged in before accessing any route.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token, excluding password
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        res.status(401);
        throw new Error('User not found, authorization denied');
      }

      next(); 
    } catch (error) {
      console.error("Token Error:", error.message);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }
});

/**
 * ✅ 2. ADMIN ONLY
 * Restricts access to users with the 'admin' role.
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403); // Forbidden
    const error = new Error('Access denied: Admin privileges required');
    next(error);
  }
};

/**
 * ✅ 3. SUPERVISOR ONLY
 * Restricts access to users with the 'supervisor' role.
 * Matches your projectRoutes.js requirements.
 */
const supervisor = (req, res, next) => {
  if (req.user && req.user.role === 'supervisor') {
    next();
  } else {
    res.status(403); // Forbidden
    const error = new Error('Access denied: Supervisor privileges required');
    next(error);
  }
};

module.exports = { protect, admin, supervisor };