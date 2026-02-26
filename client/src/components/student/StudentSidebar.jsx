import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaChartPie, 
  FaFileAlt, 
  FaUserTie, 
  FaFolderOpen, 
  FaUserCircle, 
  FaSignOutAlt,
  FaChartLine,
  FaBell,
  FaMagic // Added for the Roadmap icon
} from 'react-icons/fa';

const StudentSidebar = ({ activeTab, setActiveTab, project }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  return (
    <aside className="w-72 bg-white border-r border-neutral-100 hidden lg:flex flex-col p-8 shadow-sm z-20">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="bg-neutral-900 p-2.5 rounded-2xl text-white shadow-xl">
          <FaUserCircle size={20} />
        </div>
        <span className="text-2xl font-black text-neutral-900 italic">
          NEXUS<span className="text-primary-600">.</span>
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-3">
        <SidebarLink 
          icon={<FaChartPie />} 
          label="Overview" 
          active={activeTab === 'overview'} 
          onClick={() => setActiveTab('overview')} 
        />
        
        <SidebarLink 
          icon={<FaFileAlt />} 
          label="Proposal" 
          active={activeTab === 'proposal'} 
          onClick={() => setActiveTab('proposal')} 
        />

        {/* NEW: AI ROADMAP LINK */}
        <SidebarLink 
          icon={<FaMagic />} 
          label="Roadmap" 
          active={activeTab === 'roadmap'} 
          onClick={() => setActiveTab('roadmap')} 
        />

        <SidebarLink 
          icon={<FaChartLine />} 
          label="Tracker" 
          active={activeTab === 'tracker'} 
          onClick={() => setActiveTab('tracker')} 
        />

        <SidebarLink 
          icon={<FaBell />} 
          label="Notifications" 
          active={activeTab === 'notifications'} 
          onClick={() => setActiveTab('notifications')} 
        />

        <SidebarLink 
          icon={<FaUserTie />} 
          label="Supervisor" 
          active={activeTab === 'supervisor'} 
          onClick={() => setActiveTab('supervisor')} 
        />

        <SidebarLink 
          icon={<FaFolderOpen />} 
          label="Documents" 
          active={activeTab === 'documents'} 
          onClick={() => setActiveTab('documents')} 
        />

        <SidebarLink 
          icon={<FaUserCircle />} 
          label="My Profile" 
          active={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')} 
        />
      </nav>

      {/* Footer / Logout */}
      <div className="mt-auto pt-8 border-t border-neutral-50">
        {project && (
          <div className="mb-6 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
            <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-1">Active Project</p>
            <p className="text-xs font-black text-neutral-800 truncate">{project.title}</p>
          </div>
        )}
        
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-3 px-4 text-neutral-400 font-black text-xs uppercase tracking-widest hover:text-error-500 transition-colors w-full group"
        >
          <FaSignOutAlt className="group-hover:-translate-x-1 transition-transform" /> 
          Sign Out
        </button>
      </div>
    </aside>
  );
};

const SidebarLink = ({ icon, label, active, onClick }) => (
  <div 
    onClick={onClick} 
    className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer ${
      active 
        ? 'bg-neutral-900 text-white shadow-xl shadow-neutral-200 scale-105' 
        : 'text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600'
    }`}
  >
    <span className={`text-lg transition-colors ${active ? 'text-primary-400' : ''}`}>{icon}</span>
    <span>{label}</span>
  </div>
);

export default StudentSidebar;