import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaChalkboardTeacher, FaSignOutAlt, FaUsers, 
  FaProjectDiagram, FaChartLine, FaFolderOpen,
  FaInbox, FaBell, FaCalendarAlt, FaPlus, FaGlobe,
  FaChevronLeft, FaFilePdf, FaExternalLinkAlt, FaClock, FaCode,
  FaStar, FaTasks, FaHistory
} from "react-icons/fa";
import api from "../services/api"; 

// Components
import SupervisionRequests from "../components/supervisor/SupervisionRequests";
import StudentProgressView from '../components/supervisor/StudentProgressView'; 
import ActiveProjectCard from "../components/supervisor/ActiveProjectCard";
import ProjectRoadmapView from '../components/supervisor/ProjectRoadmapView';
import AddGroupTaskModal from '../components/supervisor/AddGroupTaskModal';
import NotificationsTab from "../components/student/NotificationsTab";
import GradingModal from "../components/supervisor/GradingModal"; 
import ProjectDeepDive from "../components/supervisor/ProjectDeepDive";

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview"); 
  const [activeProjects, setActiveProjects] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [adminMilestones, setAdminMilestones] = useState([]); 
  const [notifications, setNotifications] = useState([]);
  
  const [stats, setStats] = useState({ active: 0, completed: 0, requests: 0, max: 5 });
  const [loading, setLoading] = useState(true);
  const [viewingProject, setViewingProject] = useState(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedProjectForTask, setSelectedProjectForTask] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  // ✅ FIXED: Accurately counts unread notifications without fake fallback numbers
  const unreadCount = notifications.filter(n => n.isRead !== true && n.read !== true).length;

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [dashRes, deadRes, notifRes] = await Promise.allSettled([
        api.get("/projects/supervisor/dashboard"),
        api.get("/deadlines"),
        api.get("/notifications/my")
      ]);

      if (dashRes.status === "fulfilled") {
        const active = dashRes.value.data.activeProjects || [];
        const pending = dashRes.value.data.pendingRequests || [];
        setActiveProjects(active);
        setPendingRequests(pending);
        setStats({
          active: active.filter(p => p.status === 'Ongoing').length,
          completed: active.filter(p => p.status === 'Completed').length,
          requests: pending.length,
          max: userInfo?.maxProjects || 5
        });

        if (viewingProject) {
          const updatedView = active.find(p => p._id === viewingProject._id);
          if (updatedView) setViewingProject(updatedView);
        }
      }

      if (deadRes.status === "fulfilled") {
        setAdminMilestones((deadRes.value.data || []).filter(d => d.scope === 'Global' || d.scope === 'Batch'));
      }

      if (notifRes.status === "fulfilled") {
        setNotifications(notifRes.value.data || []);
      }

    } catch (error) { console.error("Sync Error:", error); } 
    finally { setLoading(false); }
  }, [userInfo?.maxProjects, viewingProject]);

  useEffect(() => {
    if (!userInfo || userInfo.role !== "supervisor") navigate("/");
    else fetchDashboardData();
  }, [navigate]); 

  useEffect(() => {
      fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const openTaskModal = (project) => {
    setSelectedProjectForTask(project);
    setIsTaskModalOpen(true);
  };

  // ✅ NEW: Handles clicking the Notifications Tab/Button
  const handleOpenNotifications = () => {
    setActiveTab('notifications');
    setViewingProject(null);
    
    // 1. Instantly hide the red dot on the frontend
    setNotifications(prev => prev.map(n => ({ ...n, read: true, isRead: true })));
    
    // 2. Silently tell the backend database they are read so it saves permanently
    api.put('/notifications/mark-read').catch(() => console.log("Backend sync pending."));
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-4">
        <div className="text-blue-600 font-black animate-bounce tracking-tighter text-3xl">NEXUS<span className="text-slate-900">.</span></div>
        <div className="text-center font-black text-slate-400 text-xs tracking-widest uppercase">Syncing Dashboard...</div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-white border-r border-slate-100 hidden lg:flex flex-col p-8 shadow-sm z-20">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="bg-slate-900 p-2.5 rounded-2xl text-white shadow-xl">
            <FaChalkboardTeacher size={20} />
          </div>
          <span className="text-2xl font-black text-slate-900 italic">NEXUS<span className="text-blue-600">.</span></span>
        </div>

        <nav className="flex-1 space-y-3">
          <SidebarLink icon={<FaChartLine />} label="Overview" active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); setViewingProject(null); }} />
          <SidebarLink icon={<FaInbox />} label="Requests" badge={stats.requests} active={activeTab === 'requests'} onClick={() => { setActiveTab('requests'); setViewingProject(null); }} />
          <SidebarLink icon={<FaUsers />} label="Assigned Groups" active={activeTab === 'assigned'} onClick={() => setActiveTab('assigned')} />
          <SidebarLink icon={<FaTasks />} label="Task Tracker" active={activeTab === 'tracker'} onClick={() => { setActiveTab('tracker'); setViewingProject(null); }} />
          <SidebarLink icon={<FaCalendarAlt />} label="Roadmaps" active={activeTab === 'roadmaps'} onClick={() => { setActiveTab('roadmaps'); setViewingProject(null); }} />
          
          {/* ✅ WIRED UP TO THE NEW HANDLER */}
          <SidebarLink icon={<FaBell />} label="Notifications" badge={unreadCount} active={activeTab === 'notifications'} onClick={handleOpenNotifications} />
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 p-5 text-slate-400 font-black text-[11px] uppercase tracking-widest hover:text-rose-500 transition-colors mt-auto">
          <FaSignOutAlt /> Sign Out
        </button>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar relative z-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight capitalize">{activeTab.replace('-', ' ')}</h1>
            <p className="text-slate-400 font-medium text-sm mt-1">Professor {userInfo?.name}</p>
          </div>
          <div className="flex items-center gap-5 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
            <div className="text-right ml-2">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Workload</p>
              <p className="text-xl font-black text-blue-600 leading-none mt-1">{stats.active} / {stats.max}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
              <FaUsers size={20} />
            </div>
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              <div className="xl:col-span-2 space-y-8">
                <section className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
                   <div className="flex items-center gap-3 mb-8 px-2">
                     <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                       <FaGlobe size={12} />
                     </div>
                     <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Official Roadmap</h3>
                   </div>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {adminMilestones.map((m) => (
                        <div key={m._id} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-xl transition-all group">
                          <span className="px-3 py-1 bg-blue-600 text-white text-[8px] font-black rounded-lg uppercase tracking-widest">{m.scope}</span>
                          <h4 className="text-sm font-black text-slate-800 mt-4 line-clamp-1 group-hover:text-blue-600 transition-colors">{m.title}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 flex items-center gap-2">
                            <FaClock size={10} /> {new Date(m.deadlineDate).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                   </div>
                </section>

                <section className="bg-gradient-to-br from-slate-900 to-slate-800 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between">
                    <div className="relative z-10">
                      <h2 className="text-2xl font-black tracking-tight">Faculty Action Hub</h2>
                      <p className="text-slate-400 text-sm mt-2 max-w-sm">Review incoming student proposals and manage your active project groups.</p>
                    </div>
                    <button onClick={() => setActiveTab('requests')} className="mt-6 md:mt-0 relative z-10 bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-[0_0_30px_-5px_rgba(37,99,235,0.4)] transition-all active:scale-95">
                      Review Requests ({stats.requests})
                    </button>
                    <FaProjectDiagram className="absolute -bottom-10 -right-10 text-white/5 text-[15rem] pointer-events-none" />
                </section>
              </div>

              <div className="xl:col-span-1">
                <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col h-full relative overflow-hidden">
                   <div className="flex items-center justify-between mb-8 relative z-10">
                      <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
                         <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Recent Activity</h3>
                      </div>
                   </div>
                   
                   <div className="flex-1 space-y-4 relative z-10">
                      {notifications.slice(0, 5).map(n => {
                        const isSystem = n.type === 'System';
                        return (
                          <div key={n._id} className="p-5 rounded-2xl bg-slate-50 hover:bg-blue-50/50 border border-slate-100 hover:border-blue-100 transition-all group flex gap-4 cursor-default">
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${isSystem ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                {isSystem ? <FaBell size={14} /> : <FaHistory size={14} />}
                             </div>
                             <div>
                                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-1 group-hover:text-blue-600 transition-colors">{n.title}</h4>
                                <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">{n.message}</p>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-3 block">
                                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                                </span>
                             </div>
                          </div>
                        );
                      })}

                      {notifications.length === 0 && (
                         <div className="text-center py-20">
                            <FaInbox className="text-5xl text-slate-200 mx-auto mb-4" />
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Inbox is clear</p>
                         </div>
                      )}
                   </div>

                   {/* ✅ WIRED UP TO THE NEW HANDLER */}
                   <button onClick={handleOpenNotifications} className="w-full mt-8 py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative z-10 shadow-lg active:scale-[0.98]">
                      Open Full Inbox
                   </button>

                   <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                </section>
              </div>
            </div>
          )}

          {activeTab === "requests" && <SupervisionRequests userInfo={userInfo} refreshDashboard={fetchDashboardData} />}

          {activeTab === "assigned" && (
            <div className="space-y-8">
              {viewingProject ? (
                <ProjectDeepDive project={viewingProject} onBack={() => setViewingProject(null)} onRefresh={fetchDashboardData} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {activeProjects.map(project => (
                    <div key={project._id} className="relative group cursor-pointer" onClick={() => setViewingProject(project)}>
                       <ActiveProjectCard project={project} />
                       <div className="absolute inset-0 z-10 bg-blue-600/0 group-hover:bg-blue-600/5 rounded-[3rem] transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="bg-white text-blue-600 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl pointer-events-none transform translate-y-4 group-hover:translate-y-0 transition-all">
                            Open Workspace
                          </span>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "tracker" && <StudentProgressView projects={activeProjects} refreshData={fetchDashboardData} />}

          {activeTab === "roadmaps" && (
            <div className="space-y-12">
               {activeProjects.filter(p => p.status === 'Ongoing').map(project => (
                 <div key={project._id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                       <h4 className="text-xl font-black text-slate-800 tracking-tight">{project.title}</h4>
                       <button onClick={() => openTaskModal(project)} className="px-6 py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 shadow-lg">
                         <FaPlus size={10} /> Assign Task
                       </button>
                    </div>
                    <ProjectRoadmapView projectId={project._id} filterScope="Group" />
                 </div>
               ))}
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="py-2">
              <NotificationsTab />
            </div>
          )}

        </div>
      </main>

      {isTaskModalOpen && (
        <AddGroupTaskModal 
          isOpen={isTaskModalOpen} 
          onClose={() => setIsTaskModalOpen(false)} 
          project={selectedProjectForTask} 
          onRefresh={fetchDashboardData} 
        />
      )}
    </div>
  );
};

const SidebarLink = ({ icon, label, active, onClick, badge }) => (
  <div onClick={onClick} className={`relative flex items-center gap-4 px-6 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all cursor-pointer ${
    active ? 'bg-slate-900 text-white shadow-2xl scale-[1.02]' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
  }`}>
    <span className="text-xl">{icon}</span>
    <span>{label}</span>
    
    {badge > 0 && (
      <span className="absolute right-4 w-6 h-6 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-md animate-pulse">
        {badge}
      </span>
    )}
  </div>
);

export default SupervisorDashboard;