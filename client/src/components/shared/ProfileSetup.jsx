import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaEnvelope, FaPhone, FaCheck, FaTimes, FaBell, FaUser,
  FaGraduationCap, FaBriefcase, FaSave, FaArrowRight
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';

const ProfileSetup = ({ onComplete, userInfo }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    personalEmail: '',
    phoneNumber: '',
    emailPreferences: {
      projectUpdates: true,
      deadlineReminders: true,
      gradeNotifications: true,
      taskAssignments: true,
      systemNotifications: false
    }
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Check if profile is already complete
    const checkProfileStatus = async () => {
      try {
        const { data } = await api.get('/profile/setup-status');
        if (data.profileSetupComplete) {
          onComplete();
        } else {
          // Pre-fill any existing data
          setFormData(prev => ({
            ...prev,
            personalEmail: data.personalEmail || '',
            phoneNumber: data.phoneNumber || '',
            emailPreferences: data.emailPreferences || prev.emailPreferences
          }));
        }
      } catch (error) {
        console.error('Error checking profile status:', error);
      }
    };
    
    checkProfileStatus();
  }, [onComplete]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateStep = () => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.personalEmail.trim()) {
        newErrors.personalEmail = 'Personal email is required';
      } else if (!validateEmail(formData.personalEmail)) {
        newErrors.personalEmail = 'Please enter a valid email address';
      }
      
      if (formData.phoneNumber && formData.phoneNumber.length < 10) {
        newErrors.phoneNumber = 'Please enter a valid phone number';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step < 3) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/profile/setup', formData);
      toast.success('Profile setup completed successfully!');
      onComplete();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete profile setup');
      setErrors(error.response?.data?.errors || {});
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('emailPreferences.')) {
      const prefKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        emailPreferences: {
          ...prev.emailPreferences,
          [prefKey]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <FaUser className="text-white text-3xl" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to NEXUS!</h2>
              <p className="text-gray-600">Let's set up your profile to enable email notifications</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaEnvelope className="text-blue-500" />
                  Personal Email Address *
                </label>
                <input
                  type="email"
                  name="personalEmail"
                  value={formData.personalEmail}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  className={`w-full px-4 py-3 rounded-2xl border ${errors.personalEmail ? 'border-red-500' : 'border-gray-200'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all`}
                />
                {errors.personalEmail && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <FaTimes size={12} />
                    {errors.personalEmail}
                  </p>
                )}
                <p className="text-gray-500 text-sm mt-1">
                  This email will be used for important project notifications
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaPhone className="text-green-500" />
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  className={`w-full px-4 py-3 rounded-2xl border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-200'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all`}
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <FaTimes size={12} />
                    {errors.phoneNumber}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <FaBell className="text-white text-3xl" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Email Preferences</h2>
              <p className="text-gray-600">Choose which notifications you'd like to receive</p>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-2xl">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="emailPreferences.projectUpdates"
                      checked={formData.emailPreferences.projectUpdates}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600 rounded-lg focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">Project Updates</p>
                      <p className="text-sm text-gray-600">Status changes, supervisor responses</p>
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
                      checked={formData.emailPreferences.deadlineReminders}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-green-600 rounded-lg focus:ring-green-500"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">Deadline Reminders</p>
                      <p className="text-sm text-gray-600">Upcoming project deadlines</p>
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
                      checked={formData.emailPreferences.gradeNotifications}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-purple-600 rounded-lg focus:ring-purple-500"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">Grade Notifications</p>
                      <p className="text-sm text-gray-600">When your project is graded</p>
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
                      checked={formData.emailPreferences.taskAssignments}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-orange-600 rounded-lg focus:ring-orange-500"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">Task Assignments</p>
                      <p className="text-sm text-gray-600">New tasks assigned to you</p>
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
                      checked={formData.emailPreferences.systemNotifications}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-gray-600 rounded-lg focus:ring-gray-500"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">System Notifications</p>
                      <p className="text-sm text-gray-600">Platform updates and announcements</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <FaCheck className="text-white text-3xl" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Review & Complete</h2>
              <p className="text-gray-600">Please review your information before completing setup</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Personal Email</p>
                <p className="text-gray-900">{formData.personalEmail}</p>
              </div>
              
              {formData.phoneNumber && (
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Phone Number</p>
                  <p className="text-gray-900">{formData.phoneNumber}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">Email Preferences</p>
                <div className="grid grid-cols-2 gap-2">
                  {formData.emailPreferences.projectUpdates && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">Project Updates</span>
                  )}
                  {formData.emailPreferences.deadlineReminders && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm">Deadline Reminders</span>
                  )}
                  {formData.emailPreferences.gradeNotifications && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm">Grade Notifications</span>
                  )}
                  {formData.emailPreferences.taskAssignments && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm">Task Assignments</span>
                  )}
                  {formData.emailPreferences.systemNotifications && (
                    <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm">System Notifications</span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 p-4 rounded-2xl">
              <p className="text-green-800 text-sm">
                <strong>Important:</strong> By completing this setup, you agree to receive email notifications for the selected preferences. You can change these settings anytime in your profile.
              </p>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-gray-200/60 shadow-2xl"
        >
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">Step {step} of 3</span>
              <span className="text-sm font-medium text-gray-500">
                {step === 1 && 'Personal Information'}
                {step === 2 && 'Email Preferences'}
                {step === 3 && 'Review & Complete'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                initial={{ width: '33.33%' }}
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={step === 1}
              className="px-6 py-3 rounded-2xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 text-gray-700"
            >
              Previous
            </button>
            
            <button
              onClick={handleNext}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-semibold transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : step === 3 ? (
                <>
                  <FaSave />
                  Complete Setup
                </>
              ) : (
                <>
                  Next
                  <FaArrowRight />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileSetup;
