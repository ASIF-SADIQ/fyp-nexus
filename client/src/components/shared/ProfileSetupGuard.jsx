import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkProfileSetup } from '../../services/api';
import ProfileSetup from './ProfileSetup';

const ProfileSetupGuard = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requiresSetup, setRequiresSetup] = useState(false);
  const [profileInfo, setProfileInfo] = useState(null);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const response = await checkProfileSetup();
        
        if (response.data.success) {
          const { profileInfo } = response.data;
          setProfileInfo(profileInfo);
          
          // Check if profile setup is required
          if (profileInfo.requiresSetup || profileInfo.requiresEmail) {
            setRequiresSetup(true);
          }
        }
      } catch (error) {
        console.error('Profile check error:', error);
        
        // Check if it's a 422 response indicating setup required
        if (error.response?.status === 422) {
          setRequiresSetup(true);
          setProfileInfo({
            requiresSetup: true,
            requiresEmail: error.response.data.requiresEmailSetup || false,
            name: error.response.data.user?.name || 'User',
            role: error.response.data.user?.role || 'student'
          });
        }
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, []);

  const handleProfileComplete = () => {
    setRequiresSetup(false);
    setProfileInfo(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-slate-900 rounded-3xl flex items-center justify-center shadow-2xl">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">NEXUS</h2>
            <div className="text-sm text-slate-500 font-medium">Checking profile setup...</div>
          </div>
        </div>
      </div>
    );
  }

  if (requiresSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <ProfileSetup 
          onComplete={handleProfileComplete}
          userInfo={profileInfo}
        />
      </div>
    );
  }

  return children;
};

export default ProfileSetupGuard;
