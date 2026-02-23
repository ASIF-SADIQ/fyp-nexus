const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Project = require('../models/Project');

// @desc    Get System Stats (Enhanced for Visibility)
const getStats = asyncHandler(async (req, res) => {
  const studentCount = await User.countDocuments({ role: 'student' });
  const supervisorCount = await User.countDocuments({ role: 'supervisor' });
  
  // Calculate how many students are assigned vs unassigned
  const studentsWithTeams = await User.countDocuments({ role: 'student', hasProject: true });
  const studentsWithoutTeams = studentCount - studentsWithTeams;

  const projectCount = await Project.countDocuments();
  const pendingProjects = await Project.countDocuments({ status: 'Pending' });

  res.json({
    students: studentCount,
    supervisors: supervisorCount,
    projects: projectCount,
    pending: pendingProjects,
    teamStats: {
        assigned: studentsWithTeams,
        unassigned: studentsWithoutTeams
    }
  });
});

// @desc    Get All Users (Populated with Project Visibility)
const getAllUsers = asyncHandler(async (req, res) => {
  // We populate 'project' so Admin can see which project a member belongs to
  const users = await User.find({})
    .select('-password')
    .populate('project', 'title status') 
    .sort({ createdAt: -1 });

  res.json(users);
});

// @desc    Update Project Status & Sync User Visibility
const updateProjectStatus = asyncHandler(async (req, res) => {
    const { status, adminFeedback } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    project.status = status;
    project.adminFeedback = adminFeedback || project.adminFeedback;

    // ✅ CRITICAL FOR VISIBILITY: If Rejected, "Unlock" all team members 
    // so they show as "Unassigned" and can submit a new proposal.
    if (status === 'Rejected') {
        await User.updateMany(
            { _id: { $in: project.members } },
            { $set: { hasProject: false, project: null, isLeader: false } }
        );
    }

    await project.save();
    res.json({ message: `Project is now ${status}`, project });
});

// @desc    Delete User & Update Project Members
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    // If the user being deleted is in a project, pull them out of the member list
    if (user.project) {
        await Project.findByIdAndUpdate(user.project, {
            $pull: { members: user._id }
        });
    }
    await user.deleteOne();
    res.json({ message: 'User removed and project data cleaned up' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = { getStats, getAllUsers, deleteUser, updateProjectStatus };