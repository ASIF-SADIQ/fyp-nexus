const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register new user
// @route   POST /api/users/register
// @access  Disabled (Allotment only)
const registerUser = asyncHandler(async (req, res) => {
  // 🛑 Public registration is disabled to maintain institutional control
  res.status(403);
  throw new Error('Public registration is disabled. Please contact Admin for account allotment.');
});

// @desc    Authenticate a user
// @route   POST /api/users/login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      // ✅ CRITICAL: Send these to the frontend
      department: user.department, 
      batch: user.batch,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get current user data
// @route   GET /api/users/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    expertise: user.expertise || [],
    maxProjects: user.maxProjects || 0,
    currentProjects: user.currentProjects || 0,
    skills: user.skills || "",
    bio: user.bio || "",
    githubLink: user.githubLink || "",
    notifications: user.notifications || [] 
  });
});

// @desc    Get all users (Search)
// @route   GET /api/users?search=
const getUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { skills: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.json(users);
});

// @desc    Update User Profile (LOCKED: Password logic removed)
// @route   PUT /api/users/profile
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // Users can update their portfolio info, but NOT their credentials
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.skills = req.body.skills || user.skills;
    user.bio = req.body.bio || user.bio;
    user.githubLink = req.body.githubLink || user.githubLink;
    
    // 🛑 Note: user.password logic is removed to follow the IT-Only policy 

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      skills: updatedUser.skills,
      bio: updatedUser.bio,
      githubLink: updatedUser.githubLink,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Admin Reset User Password to Default (Physical Method)
// @route   PUT /api/users/reset-password/:id
const resetPassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    const salt = await bcrypt.genSalt(10);
    // Standard default for IT-led resets
    user.password = await bcrypt.hash("Nexus@123", salt); 
    await user.save();
    
    res.json({ message: `Password for ${user.name} reset to: Nexus@123` });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Send an Invite (Notification)
// @route   POST /api/users/invite
const sendInvite = asyncHandler(async (req, res) => {
  const { recipientId } = req.body;
  const sender = await User.findById(req.user._id);
  const recipient = await User.findById(recipientId);

  if (!recipient) {
    res.status(404);
    throw new Error('User not found');
  }

  const newNotification = {
    senderName: sender.name,
    senderId: sender._id, 
    message: `${sender.name} wants to join your team! Check their profile.`,
    read: false,
  };

  recipient.notifications.push(newNotification);
  await recipient.save();

  res.json({ message: "Invite Sent!" });
});

// @desc    Delete a Notification
// @route   DELETE /api/users/notifications/:id
const deleteNotification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.notifications = user.notifications.filter(
    (notif) => notif._id.toString() !== req.params.id
  );

  await user.save();
  res.status(200).json(user.notifications);
});

// @desc    Get All Users (for Admin Management)
// @route   GET /api/users
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
});

// @desc    Delete a User
// @route   DELETE /api/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await user.deleteOne();
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateUserProfile,
  getUsers,
  sendInvite,
  deleteNotification,
  getAllUsers,
  deleteUser,
  resetPassword 
};