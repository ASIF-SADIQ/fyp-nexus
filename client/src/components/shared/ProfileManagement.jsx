import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaEnvelope, FaPhone, FaUser, FaSave, FaBell, FaGraduationCap,
  FaBriefcase, FaGithub, FaLinkedin, FaGlobe, FaEdit, FaCheck,
  FaTimes, FaSpinner
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';

const ProfileManagement = ({ userInfo }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    personalEmail: '',
    phoneNumber: '',
    bio: '',
    skills: [],
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    expertise: [],
    emailPreferences: {
      projectUpdates: true,
      deadlineReminders: true,
      gradeNotifications: true,
      taskAssignments: true,
      systemNotifications: false
    }
  });

  const [tempFormData, setTempFormData] = useState({...formData});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/profile');
      setFormData(data);
      setTempFormData(data);
    } catch (error) {
      toast.error('Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (editMode) {
      // Cancel editing - revert to original data
      setTempFormData({...formData});
      setErrors({});
    }
    setEditMode(!editMode);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('emailPreferences.')) {
      const prefKey = name.split('.')[1];
      setTempFormData(prev => ({
        ...prev,
        emailPreferences: {
          ...prev.emailPreferences,
          [prefKey]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name === 'skills' || name === 'expertise') {
      // Handle array fields (comma-separated)
      const arrayValue = value.split(',').map(item => item.trim()).filter(Boolean);
      setTempFormData(prev => ({
        ...prev,
        [name]: arrayValue
      }));
    } else {
      setTempFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!tempFormData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (tempFormData.personalEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tempFormData.personalEmail)) {
      newErrors.personalEmail = 'Please enter a valid email address';
    }
    
    if (tempFormData.phoneNumber && tempFormData.phoneNumber.length < 10) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      const { data } = await api.put('/profile', tempFormData);
      setFormData(data);
      setTempFormData(data);
      setEditMode(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
      setErrors(error.response?.data?.errors || {});
    } finally {
      setSaving(false);
    }
  };

  const handleEmailPreferencesSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/profile/email-preferences', {
        emailPreferences: tempFormData.emailPreferences
      });
      
      setFormData(prev => ({
        ...prev,
        emailPreferences: data.emailPreferences
      }));
      
      setTempFormData(prev => ({
        ...prev,
        emailPreferences: data.emailPreferences
      }));
      
      toast.success('Email preferences updated successfully!');
    } catch (error) {
      toast.error('Failed to update email preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaSpinner className="text-4xl text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Management</h1>
          <p className="text-gray-600">Manage your personal information and email preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-gray-200/60 shadow-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <FaUser className="text-blue-500" />
                  Personal Information
                </h2>
                <button
                  onClick={handleEditToggle}
                  className={`px-4 py-2 rounded-2xl font-semibold transition-all flex items-center gap-2 ${
                    editMode 
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {editMode ? (
                    <>
                      <FaTimes />
                      Cancel
                    </>
                  ) : (
                    <>
                      <FaEdit />
                      Edit
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editMode ? tempFormData.name : formData.name}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className={`w-full px-4 py-3 rounded-2xl border ${
                        errors.name ? 'border-red-500' : 'border-gray-200'
                      } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all ${
                        !editMode ? 'bg-gray-50 cursor-not-allowed' : ''
                      }`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <FaTimes size={12} />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      University Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 cursor-not-allowed"
                    />
                    <p className="text-gray-500 text-xs mt-1">Cannot be changed</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FaEnvelope className="text-green-500" />
                      Personal Email
                    </label>
                    <input
                      type="email"
                      name="personalEmail"
                      value={editMode ? tempFormData.personalEmail : formData.personalEmail}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className={`w-full px-4 py-3 rounded-2xl border ${
                        errors.personalEmail ? 'border-red-500' : 'border-gray-200'
                      } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all ${
                        !editMode ? 'bg-gray-50 cursor-not-allowed' : ''
                      }`}
                    />
                    {errors.personalEmail && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <FaTimes size={12} />
                        {errors.personalEmail}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FaPhone className="text-purple-500" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={editMode ? tempFormData.phoneNumber : formData.phoneNumber}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className={`w-full px-4 py-3 rounded-2xl border ${
                        errors.phoneNumber ? 'border-red-500' : 'border-gray-200'
                      } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all ${
                        !editMode ? 'bg-gray-50 cursor-not-allowed' : ''
                      }`}
                    />
                    {errors.phoneNumber && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <FaTimes size={12} />
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={editMode ? tempFormData.bio : formData.bio}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    rows={4}
                    className={`w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none ${
                      !editMode ? 'bg-gray-50 cursor-not-allowed' : ''
                    }`}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={editMode ? tempFormData.skills.join(', ') : formData.skills.join(', ')}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className={`w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all ${
                      !editMode ? 'bg-gray-50 cursor-not-allowed' : ''
                    }`}
                    placeholder="React, Node.js, MongoDB, etc."
                  />
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Social Links</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FaGithub className="text-gray-700" />
                        GitHub
                      </label>
                      <input
                        type="url"
                        name="githubUrl"
                        value={editMode ? tempFormData.githubUrl : formData.githubUrl}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        className={`w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all ${
                          !editMode ? 'bg-gray-50 cursor-not-allowed' : ''
                        }`}
                        placeholder="https://github.com/username"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FaLinkedin className="text-blue-600" />
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        name="linkedinUrl"
                        value={editMode ? tempFormData.linkedinUrl : formData.linkedinUrl}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        className={`w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all ${
                          !editMode ? 'bg-gray-50 cursor-not-allowed' : ''
                        }`}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FaGlobe className="text-green-600" />
                        Portfolio
                      </label>
                      <input
                        type="url"
                        name="portfolioUrl"
                        value={editMode ? tempFormData.portfolioUrl : formData.portfolioUrl}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        className={`w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all ${
                          !editMode ? 'bg-gray-50 cursor-not-allowed' : ''
                        }`}
                        placeholder="https://yourportfolio.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Teacher-specific fields */}
                {userInfo.role === 'supervisor' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FaGraduationCap className="text-purple-600" />
                      Areas of Expertise (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="expertise"
                      value={editMode ? tempFormData.expertise.join(', ') : formData.expertise.join(', ')}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className={`w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all ${
                        !editMode ? 'bg-gray-50 cursor-not-allowed' : ''
                      }`}
                      placeholder="Machine Learning, Web Development, etc."
                    />
                  </div>
                )}

                {/* Save Button */}
                {editMode && (
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-semibold transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FaSave />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Email Preferences */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-gray-200/60 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <FaBell className="text-purple-500" />
                Email Preferences
              </h2>

              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-2xl">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="emailPreferences.projectUpdates"
                        checked={tempFormData.emailPreferences.projectUpdates}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-blue-600 rounded-lg focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">Project Updates</p>
                        <p className="text-sm text-gray-600">Status changes, responses</p>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="bg-green-50 p-4 rounded-2xl">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="emailPreferences.deadlineReminders"
                        checked={tempFormData.emailPreferences.deadlineReminders}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-green-600 rounded-lg focus:ring-green-500"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">Deadline Reminders</p>
                        <p className="text-sm text-gray-600">Upcoming deadlines</p>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="bg-purple-50 p-4 rounded-2xl">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="emailPreferences.gradeNotifications"
                        checked={tempFormData.emailPreferences.gradeNotifications}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-purple-600 rounded-lg focus:ring-purple-500"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">Grade Notifications</p>
                        <p className="text-sm text-gray-600">Project grading updates</p>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="bg-orange-50 p-4 rounded-2xl">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="emailPreferences.taskAssignments"
                        checked={tempFormData.emailPreferences.taskAssignments}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-orange-600 rounded-lg focus:ring-orange-500"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">Task Assignments</p>
                        <p className="text-sm text-gray-600">New tasks assigned</p>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="emailPreferences.systemNotifications"
                        checked={tempFormData.emailPreferences.systemNotifications}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-gray-600 rounded-lg focus:ring-gray-500"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">System Notifications</p>
                        <p className="text-sm text-gray-600">Platform updates</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <button
                onClick={handleEmailPreferencesSave}
                disabled={saving}
                className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-semibold transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Save Preferences
                  </>
                )}
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileManagement;
