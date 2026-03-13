import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaChalkboardTeacher, FaSignOutAlt, FaUsers, 
  FaProjectDiagram, FaChartLine, FaFolderOpen,
  FaInbox, FaBell, FaCalendarAlt, FaPlus, FaGlobe,
  FaChevronLeft, FaFilePdf, FaExternalLinkAlt, FaClock, FaCode,
  FaStar, FaTasks, FaHistory, FaHome, FaChartBar, FaCog,
  FaUserCheck, FaClipboardCheck, FaRocket, FaCheck,
  FaUserCircle
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
import ProfileTab from "../components/student/ProfileTab";

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
  }, []); // Remove dependencies to prevent infinite loops

  useEffect(() => {
    if (!userInfo || userInfo.role !== "supervisor") navigate("/");
    else fetchDashboardData();
  }, []); // Only run once on mount

  useEffect(() => {
    fetchDashboardData();
  }, []); // Only run once on mount

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const openTaskModal = (project) => {
    setSelectedProjectForTask(project);
    setIsTaskModalOpen(true);
  };

  // ✅ NEW: Handles clicking Notifications Tab/Button
  const handleOpenNotifications = () => {
    setActiveTab('notifications');
    setViewingProject(null);
    
    // 1. Instantly hide the red dot on the frontend
    setNotifications(prev => prev.map(n => ({ ...n, read: true, isRead: true })));
    
    // 2. Silently tell the backend database they are read so it saves permanently
    api.put('/notifications/mark-read').catch(() => console.log("Backend sync pending."));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-slate-900 rounded-3xl flex items-center justify-center shadow-2xl">
            <FaChalkboardTeacher className="text-white text-3xl" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full animate-ping" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">NEXUS</h2>
          <div className="text-sm text-slate-500 font-medium">Initializing faculty dashboard...</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      
      {/* --- MODERN TOP NAVIGATION --- */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
                  <FaChalkboardTeacher className="text-white text-xl" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">NEXUS</h1>
                <p className="text-xs text-slate-500 font-medium">Faculty Portal</p>
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-4">
              {/* Workload Indicator */}
              <div className="hidden md:flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2.5 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-2">
                  <FaUsers className="text-blue-600" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Workload</p>
                    <p className="text-sm font-bold text-blue-600">{stats.active}/{stats.max}</p>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <button 
                onClick={handleOpenNotifications}
                className="relative p-3 rounded-2xl hover:bg-slate-50 transition-colors"
              >
                <FaBell className="text-slate-600 text-lg" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* User Profile */}
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">Prof. {userInfo?.name}</p>
                  <p className="text-xs text-slate-500">Department Head</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{userInfo?.name?.[0]}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* --- MODERN SIDEBAR --- */}
        <aside className="w-72 bg-white/60 backdrop-blur-xl border-r border-slate-200/60 min-h-screen hidden lg:flex">
          <nav className="p-6 space-y-2 w-full">
            <SidebarLink icon={<FaHome />} label="Dashboard" active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); setViewingProject(null); }} />
            <SidebarLink icon={<FaInbox />} label="Supervision Requests" badge={stats.requests} active={activeTab === 'requests'} onClick={() => { setActiveTab('requests'); setViewingProject(null); }} />
            <SidebarLink icon={<FaUsers />} label="Active Groups" active={activeTab === 'assigned'} onClick={() => setActiveTab('assigned')} />
            <SidebarLink icon={<FaTasks />} label="Task Tracker" active={activeTab === 'tracker'} onClick={() => { setActiveTab('tracker'); setViewingProject(null); }} />
            <SidebarLink icon={<FaCalendarAlt />} label="Project Roadmaps" active={activeTab === 'roadmaps'} onClick={() => { setActiveTab('roadmaps'); setViewingProject(null); }} />
            <SidebarLink icon={<FaBell />} label="Notifications" badge={unreadCount} active={activeTab === 'notifications'} onClick={handleOpenNotifications} />
            <SidebarLink icon={<FaUserCircle />} label="Profile" active={activeTab === 'profile'} onClick={() => { setActiveTab('profile'); setViewingProject(null); }} />
            
            <div className="pt-6 mt-6 border-t border-slate-200">
              <SidebarLink icon={<FaCog />} label="Settings" active={false} onClick={() => {}} />
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 font-medium text-sm hover:bg-rose-50 rounded-2xl transition-colors">
                <FaSignOutAlt /> Sign Out
              </button>
            </div>
          </nav>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          
          {/* Dashboard Overview */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Page Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Dashboard Overview</h2>
                  <p className="text-slate-600 mt-1">Welcome back, Professor {userInfo?.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setActiveTab('requests')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <FaInbox />
                    Review Requests ({stats.requests})
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  icon={<FaUsers />}
                  label="Active Groups"
                  value={stats.active}
                  color="blue"
                  trend="+2 this week"
                />
                <StatCard 
                  icon={<FaCheck />}
                  label="Completed"
                  value={stats.completed}
                  color="green"
                  trend="+1 this month"
                />
                <StatCard 
                  icon={<FaInbox />}
                  label="Pending Requests"
                  value={stats.requests}
                  color="amber"
                  trend="Needs attention"
                />
                <StatCard 
                  icon={<FaChartBar />}
                  label="Workload"
                  value={`${stats.active}/${stats.max}`}
                  color="purple"
                  trend="Optimal"
                />
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* Official Roadmap */}
                <div className="xl:col-span-2">
                  <SectionCard 
                    title="Official Academic Roadmap"
                    icon={<FaCalendarAlt />}
                    subtitle="Key milestones and deadlines"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {adminMilestones.map((m) => (
                        <div key={m._id} className="group relative bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer">
                          <div className="flex items-center justify-between mb-4">
                            <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-lg uppercase">
                              {m.scope}
                            </span>
                            <FaCalendarAlt className="text-slate-400" />
                          </div>
                          <h4 className="text-sm font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {m.title}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                            <FaClock size={10} />
                            {new Date(m.deadlineDate).toLocaleDateString()}
                          </p>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <FaExternalLinkAlt className="text-blue-600 text-sm" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                </div>

                {/* Recent Activity */}
                <div className="xl:col-span-1">
                  <SectionCard 
                    title="Recent Activity"
                    icon={<FaHistory />}
                    subtitle="Latest notifications and updates"
                  >
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {notifications.slice(0, 5).map(n => {
                        const isSystem = n.type === 'System';
                        return (
                          <div key={n._id} className="group flex gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-white hover:from-blue-50 hover:to-white border border-slate-200 hover:border-blue-200 transition-all cursor-pointer">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSystem ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                              {isSystem ? <FaBell size={14} /> : <FaHistory size={14} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 truncate">
                                {n.title}
                              </h4>
                              <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
                                {n.message}
                              </p>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-2 block">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {notifications.length === 0 && (
                        <div className="text-center py-12">
                          <FaInbox className="text-4xl text-slate-200 mx-auto mb-3" />
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">All caught up</p>
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={handleOpenNotifications}
                      className="w-full mt-4 py-3 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      View All Notifications
                    </button>
                  </SectionCard>
                </div>
              </div>

              {/* Quick Actions */}
              <SectionCard 
                title="Quick Actions"
                icon={<FaRocket />}
                subtitle="Common tasks and shortcuts"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <QuickActionCard 
                    icon={<FaPlus />}
                    title="Create Task"
                    description="Assign new tasks to groups"
                    color="blue"
                    onClick={() => setActiveTab('tracker')}
                  />
                  <QuickActionCard 
                    icon={<FaFolderOpen />}
                    title="View Archives"
                    description="Access completed projects"
                    color="green"
                    onClick={() => {}}
                  />
                  <QuickActionCard 
                    icon={<FaChartLine />}
                    title="Analytics"
                    description="View performance metrics"
                    color="purple"
                    onClick={() => {}}
                  />
                </div>
              </SectionCard>
            </div>
          )}

          {/* Other Tabs */}
          {activeTab === "requests" && <SupervisionRequests userInfo={userInfo} refreshDashboard={fetchDashboardData} />}

          {activeTab === "assigned" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Active Project Groups</h2>
                <p className="text-slate-600">{activeProjects.length} groups</p>
              </div>
              
              {viewingProject ? (
                <ProjectDeepDive project={viewingProject} onBack={() => setViewingProject(null)} onRefresh={fetchDashboardData} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeProjects.map(project => (
                    <div key={project._id} className="relative group cursor-pointer" onClick={() => setViewingProject(project)}>
                       <ActiveProjectCard project={project} />
                       <div className="absolute inset-0 z-10 bg-blue-600/0 group-hover:bg-blue-600/5 rounded-3xl transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="bg-white text-blue-600 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xl pointer-events-none transform translate-y-4 group-hover:translate-y-0 transition-all">
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
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Project Roadmaps</h2>
                <p className="text-slate-600">{activeProjects.filter(p => p.status === 'Ongoing').length} active projects</p>
              </div>
              
              {activeProjects.filter(p => p.status === 'Ongoing').map(project => (
                <div key={project._id} className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl border border-slate-200/60 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="text-xl font-bold text-slate-800 tracking-tight">{project.title}</h4>
                    <button 
                      onClick={() => openTaskModal(project)} 
                      className="px-6 py-3 bg-gradient-to-r from-slate-900 to-blue-600 hover:from-slate-800 hover:to-blue-500 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg"
                    >
                      <FaPlus size={10} /> Assign Task
                    </button>
                  </div>
                  <ProjectRoadmapView projectId={project._id} filterScope="Group" />
                </div>
              ))}
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="py-4">
              <NotificationsTab />
            </div>
          )}

          {activeTab === "profile" && (
            <div className="py-4">
              <ProfileTab userInfo={userInfo} onUpdate={fetchDashboardData} />
            </div>
          )}

        </main>
      </div>

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

// Modern Sidebar Link Component
const SidebarLink = ({ icon, label, active, onClick, badge }) => (
  <div 
    onClick={onClick} 
    className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm transition-all cursor-pointer ${
      active 
        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <span className="text-lg">{icon}</span>
    <span>{label}</span>
    
    {badge > 0 && (
      <span className="absolute right-3 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
        {badge}
      </span>
    )}
  </div>
);

// Modern Stat Card Component
const StatCard = ({ icon, label, value, color, trend }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    purple: 'from-purple-500 to-purple-600'
  };

  return (
    <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
          {trend}
        </span>
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-1">{value}</h3>
      <p className="text-sm text-slate-600 font-medium">{label}</p>
    </div>
  );
};

// Modern Section Card Component
const SectionCard = ({ title, icon, subtitle, children }) => (
  <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl border border-slate-200/60 shadow-sm">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center text-blue-600">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-600">{subtitle}</p>
      </div>
    </div>
    {children}
  </div>
);

// Modern Quick Action Card Component
const QuickActionCard = ({ icon, title, description, color, onClick }) => {
  const colorClasses = {
    blue: 'hover:from-blue-50 hover:to-blue-100 hover:border-blue-300',
    green: 'hover:from-emerald-50 hover:to-emerald-100 hover:border-emerald-300',
    purple: 'hover:from-purple-50 hover:to-purple-100 hover:border-purple-300'
  };

  return (
    <div 
      onClick={onClick}
      className={`p-6 rounded-2xl border border-slate-200 bg-white cursor-pointer transition-all ${colorClasses[color]} hover:shadow-md group`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h4 className="font-semibold text-slate-900">{title}</h4>
      </div>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  );
};

export default SupervisorDashboard;