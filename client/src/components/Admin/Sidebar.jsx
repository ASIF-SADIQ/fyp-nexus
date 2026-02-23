import React from 'react';
import { 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaProjectDiagram, 
  FaUsers, 
  FaSignOutAlt,
  FaClock, 
  FaBell,
  FaShieldAlt,
  FaChevronRight
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const menuItems = [
    { id: 'allocation', label: 'Allocations', icon: <FaProjectDiagram />, category: 'Core' },
    { id: 'teachers', label: 'Faculty Directory', icon: <FaChalkboardTeacher />, category: 'Personnel' },
    { id: 'students', label: 'Student Records', icon: <FaUserGraduate />, category: 'Personnel' },
    { id: 'users', label: 'Access Control', icon: <FaUsers />, category: 'System' },
    { id: 'deadlines', label: 'Milestones', icon: <FaClock />, category: 'System' }, 
    { id: 'notifications', label: 'Broadcasts', icon: <FaBell />, category: 'System' }, 
  ];

  return (
    <aside className="w-80 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0 z-50">
      
      {/* --- Branding Section --- */}
      <div className="p-10 flex items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-2xl shadow-blue-200">
            N
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 border-4 border-white rounded-full" />
        </div>
        <div>
          <span className="text-2xl font-black text-slate-900 tracking-tighter block leading-none">Nexus</span>
          <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em]">Admin Portal</span>
        </div>
      </div>

      {/* --- Navigation Menu --- */}
      <nav className="flex-1 px-6 space-y-8 overflow-y-auto custom-scrollbar">
        
        {/* We group by category for better cognitive load management */}
        {['Core', 'Personnel', 'System'].map((cat) => (
          <div key={cat} className="space-y-2">
            <p className="px-4 text-[9px] font-black text-slate-300 uppercase tracking-[0.25em] mb-4">
              {cat} Management
            </p>
            
            {menuItems.filter(item => item.category === cat).map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] transition-all duration-300 group relative ${
                  activeTab === item.id
                    ? 'bg-slate-900 text-white shadow-2xl shadow-slate-200 scale-[1.02]'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={`text-lg transition-colors ${activeTab === item.id ? 'text-blue-400' : 'group-hover:text-blue-600'}`}>
                  {item.icon}
                </span>
                <span className="font-black text-[11px] uppercase tracking-widest">
                  {item.label}
                </span>
                
                {activeTab === item.id ? (
                  <motion.div 
                    layoutId="activeTab"
                    className="ml-auto text-blue-400"
                  >
                    <FaChevronRight size={10} />
                  </motion.div>
                ) : (
                  <div className="ml-auto w-1 h-1 bg-slate-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* --- Footer / System Status --- */}
      <div className="p-6 mt-auto space-y-4">
        <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm">
            <FaShieldAlt size={14} />
          </div>
          <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">System Status</p>
            <p className="text-[10px] font-bold text-slate-700">Encrypted & Online</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all font-black text-[10px] uppercase tracking-[0.2em] border border-transparent hover:border-rose-100"
        >
          <FaSignOutAlt />
          <span>Terminate Session</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
