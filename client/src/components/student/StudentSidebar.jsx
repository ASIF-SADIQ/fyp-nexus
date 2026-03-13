import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaChartPie, FaFileAlt, FaUserTie, FaFolderOpen, 
  FaUserCircle, FaSignOutAlt, FaChartLine, FaBell, FaMagic 
} from 'react-icons/fa';

const StudentSidebar = ({ activeTab, setActiveTab, project }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  return (
    <aside className="w-72 bg-white border-r border-neutral-100 hidden lg:flex flex-col h-screen sticky top-0 z-20">
      {/* Brand Header - Reduced margin */}
      <div className="flex items-center gap-3 p-8 pb-6">
        <div className="bg-neutral-900 p-2 rounded-xl text-white shadow-lg">
          <FaUserCircle size={18} />
        </div>
        <span className="text-xl font-black text-neutral-900 italic tracking-tighter">
          NEXUS<span className="text-primary-600">.</span>
        </span>
      </div>

      {/* Navigation Links - Compact spacing */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
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

      {/* Footer - Professional & Visible */}
      <div className="p-4 bg-neutral-50/50 border-t border-neutral-100">
        {project && (
          <div className="mb-4 p-3 bg-white rounded-xl border border-neutral-200/50 shadow-sm">
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-0.5">Active Project</p>
            <p className="text-[11px] font-bold text-neutral-700 truncate capitalize">{project.title}</p>
          </div>
        )}
        
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-3 px-4 py-3 text-neutral-500 font-black text-[10px] uppercase tracking-[0.15em] hover:text-red-600 hover:bg-red-50 rounded-xl transition-all w-full group"
        >
          <FaSignOutAlt className="text-sm group-hover:-translate-x-1 transition-transform" /> 
          Sign Out
        </button>
      </div>
    </aside>
  );
};

const SidebarLink = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center gap-4 px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all group ${
      active 
        ? 'bg-neutral-900 text-white shadow-lg shadow-neutral-200' 
        : 'text-neutral-400 hover:bg-neutral-50 hover:text-neutral-900'
    }`}
  >
    <span className={`text-base transition-colors ${active ? 'text-primary-400' : 'group-hover:text-primary-500'}`}>
      {icon}
    </span>
    <span>{label}</span>
  </button>
);

export default StudentSidebar;