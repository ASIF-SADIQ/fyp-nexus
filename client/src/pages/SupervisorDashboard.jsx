import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaChalkboardTeacher, FaSignOutAlt, FaUsers, 
  FaProjectDiagram, FaChartLine, FaFolderOpen,
  FaInbox, FaBell, FaCalendarAlt, FaPlus, FaGlobe,
  FaChevronLeft, FaFilePdf, FaExternalLinkAlt, FaClock, FaCode,
  FaStar, FaTasks // ✅ Added FaTasks for the new tab
} from "react-icons/fa";
import api from "../services/api"; 

// Components
import SupervisionRequests from "../components/supervisor/SupervisionRequests";
import StudentProgressView from '../components/supervisor/StudentProgressView'; // ✅ New Tracker View
import ActiveProjectCard from "../components/supervisor/ActiveProjectCard";
import ProjectRoadmapView from '../components/supervisor/ProjectRoadmapView';
import AddGroupTaskModal from '../components/supervisor/AddGroupTaskModal';
import NotificationsTab from "../components/student/NotificationsTab";
import GradingModal from "../components/supervisor/GradingModal"; 

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview"); 
  const [activeProjects, setActiveProjects] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [adminMilestones, setAdminMilestones] = useState([]); 
  const [stats, setStats] = useState({ active: 0, completed: 0, requests: 0, max: 5 });
  const [loading, setLoading] = useState(true);
  
  // Master-Detail view state
  const [viewingProject, setViewingProject] = useState(null);

  // Task Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedProjectForTask, setSelectedProjectForTask] = useState(null);

  // Grading Modal State
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [projectForGrading, setProjectForGrading] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: dashData } = await api.get("/projects/supervisor/dashboard"); 
      
      const active = dashData.activeProjects || [];
      const pending = dashData.pendingRequests || [];
      setActiveProjects(active);
      setPendingRequests(pending);
      setStats({
        active: active.filter(p => p.status === 'Ongoing').length,
        completed: active.filter(p => p.status === 'Completed').length,
        requests: pending.length,
        max: userInfo?.maxProjects || 5
      });

      // Update the "viewingProject" if it is currently open
      if (viewingProject) {
        const updatedView = active.find(p => p._id === viewingProject._id);
        if (updatedView) setViewingProject(updatedView);
      }

      try {
        const { data: deadlinesData } = await api.get("/deadlines");
        setAdminMilestones((deadlinesData || []).filter(d => d.scope === 'Global' || d.scope === 'Batch'));
      } catch (err) { console.warn("Deadlines fetch failed."); }

    } catch (error) { console.error("Sync Error:", error); } 
    finally { setLoading(false); }
  }, [userInfo?.maxProjects, viewingProject]);

  useEffect(() => {
    if (!userInfo || userInfo.role !== "supervisor") navigate("/");
    else fetchDashboardData();
  }, [navigate]); 

  // Initial Load
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

  const handleOpenGrading = (project, submission) => {
    setProjectForGrading(project);
    setSelectedSubmission(submission);
    setIsGradingModalOpen(true);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="text-center font-black text-blue-600 animate-pulse">NEXUS SYNCING...</div>
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
          <SidebarLink icon={<FaInbox />} label="Requests" active={activeTab === 'requests'} onClick={() => { setActiveTab('requests'); setViewingProject(null); }} />
          <SidebarLink icon={<FaUsers />} label="Assigned Groups" active={activeTab === 'assigned'} onClick={() => setActiveTab('assigned')} />
          
          {/* ✅ NEW TAB: Task Tracker (Student Progress View) */}
          <SidebarLink icon={<FaTasks />} label="Task Tracker" active={activeTab === 'tracker'} onClick={() => { setActiveTab('tracker'); setViewingProject(null); }} />
          
          <SidebarLink icon={<FaCalendarAlt />} label="Roadmaps" active={activeTab === 'roadmaps'} onClick={() => { setActiveTab('roadmaps'); setViewingProject(null); }} />
          <SidebarLink icon={<FaBell />} label="Notifications" active={activeTab === 'notifications'} onClick={() => { setActiveTab('notifications'); setViewingProject(null); }} />
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 p-5 text-slate-400 font-black text-[11px] uppercase tracking-widest hover:text-red-500 mt-auto">
          <FaSignOutAlt /> Sign Out
        </button>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar relative z-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight capitalize">{activeTab.replace('-', ' ')}</h1>
            <p className="text-slate-400 font-medium">Professor {userInfo?.name}</p>
          </div>
          <div className="flex items-center gap-6 bg-white p-5 rounded-[2rem] shadow-sm border border-slate-50">
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Workload</p>
              <p className="text-xl font-black text-blue-600">{stats.active} / {stats.max}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <FaUsers size={22} />
            </div>
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-12">
              <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
                 <div className="flex items-center gap-3 mb-8 px-2">
                   <FaGlobe className="text-blue-600" />
                   <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Official Roadmap</h3>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {adminMilestones.map((m) => (
                      <div key={m._id} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white transition-all">
                        <span className="px-2 py-1 bg-blue-600 text-white text-[7px] font-black rounded uppercase">{m.scope}</span>
                        <h4 className="text-sm font-black text-slate-800 mt-3 line-clamp-1">{m.title}</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{new Date(m.deadlineDate).toLocaleDateString()}</p>
                      </div>
                    ))}
                 </div>
              </section>
              <section className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                  <h2 className="text-2xl font-black">Faculty Hub</h2>
                  <button onClick={() => setActiveTab('requests')} className="mt-6 bg-blue-600 px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest">Review Requests</button>
                  <FaProjectDiagram className="absolute -bottom-10 -right-10 text-white/5 text-[15rem]" />
              </section>
            </div>
          )}

          {/* TAB 2: REQUESTS */}
          {activeTab === "requests" && <SupervisionRequests userInfo={userInfo} refreshDashboard={fetchDashboardData} />}

          {/* TAB 3: ASSIGNED GROUPS (Document Ledger) */}
          {activeTab === "assigned" && (
            <div className="space-y-8">
              {viewingProject ? (
                /* --- DETAIL VIEW --- */
                <ProjectDeepDive 
                  project={viewingProject} 
                  onBack={() => setViewingProject(null)} 
                  onGrade={handleOpenGrading} 
                />
              ) : (
                /* --- GRID VIEW --- */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {activeProjects.map(project => (
                    <div 
                      key={project._id} 
                      className="relative group cursor-pointer"
                      onClick={() => setViewingProject(project)}
                    >
                       <ActiveProjectCard project={project} />
                       <div className="absolute inset-0 z-10 bg-blue-600/0 group-hover:bg-blue-600/5 rounded-[3rem] transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="bg-white text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-xl pointer-events-none">
                            Open Project Ledger
                          </span>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ✅ TAB 4: TASK TRACKER (Student Progress Analytics) */}
          {activeTab === "tracker" && (
            <StudentProgressView 
            projects={activeProjects} 
       refreshData={fetchDashboardData}
            
            />
          )}

          {/* TAB 5: ROADMAPS */}
          {activeTab === "roadmaps" && (
            <div className="space-y-12">
               {activeProjects.filter(p => p.status === 'Ongoing').map(project => (
                 <div key={project._id} className="bg-white p-10 rounded-[3rem] border border-slate-100">
                    <div className="flex items-center justify-between mb-10">
                       <h4 className="text-lg font-black text-slate-800">{project.title}</h4>
                       <button onClick={() => openTaskModal(project)} className="px-6 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase"><FaPlus /> New Task</button>
                    </div>
                    <ProjectRoadmapView projectId={project._id} filterScope="Group" />
                 </div>
               ))}
            </div>
          )}

          {/* TAB 6: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="p-4">
              <NotificationsTab />
            </div>
          )}

        </div>
      </main>

      {/* MODALS */}
      {isTaskModalOpen && (
        <AddGroupTaskModal 
          isOpen={isTaskModalOpen} 
          onClose={() => setIsTaskModalOpen(false)} 
          project={selectedProjectForTask} 
          onRefresh={fetchDashboardData} 
        />
      )}

      <GradingModal 
        isOpen={isGradingModalOpen}
        onClose={() => setIsGradingModalOpen(false)}
        project={projectForGrading}
        submission={selectedSubmission}
        onUpdate={fetchDashboardData} 
      />
    </div>
  );
};

/* --- SUB COMPONENTS --- */

const ProjectDeepDive = ({ project, onBack, onGrade }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest transition-all">
      <FaChevronLeft /> Back to List
    </button>

    <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
      <div className="relative z-10">
        <span className="bg-blue-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase">Project Ledger</span>
        <h2 className="text-4xl font-black tracking-tight mt-4">{project.title}</h2>
        <p className="text-slate-400 mt-4 text-sm max-w-2xl leading-relaxed italic">{project.description}</p>
      </div>
      <FaCode size={200} className="absolute -right-20 -bottom-20 text-white/5 pointer-events-none" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Team Info */}
      <div className="space-y-8">
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100">
          <h3 className="text-[11px] font-black text-slate-400 uppercase mb-6">Group Members</h3>
          <div className="space-y-4">
             {[project.leader, ...project.members.filter(m => m._id !== project.leader?._id)].map((member) => (
               <div key={member._id} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm">{member.name[0]}</div>
                  <div>
                    <p className="text-xs font-black text-slate-800">{member.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">{member.rollNo}</p>
                  </div>
               </div>
             ))}
          </div>
        </section>
      </div>

      {/* Document Ledger */}
      <div className="lg:col-span-2 space-y-6">
         <h3 className="text-[11px] font-black text-slate-900 uppercase px-4">All Submitted Assets</h3>
         <div className="space-y-4">
            <SubmissionItem title="Project Proposal (Initial)" date={project.createdAt} url={project.proposalDocument} status="Original" />
            
            {project.submissions?.map((sub, i) => (
              <SubmissionItem 
                key={i} 
                title={sub.title} 
                date={sub.submittedAt} 
                url={sub.fileUrl} 
                status={sub.status}
                grade={sub.marks} 
                onGrade={() => onGrade(project, sub)} 
              />
            ))}
            
            {(!project.submissions || project.submissions.length === 0) && (
              <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem] text-slate-300 font-black text-[10px] uppercase">Awaiting Dynamic Submissions...</div>
            )}
         </div>
      </div>
    </div>
  </div>
);

const SubmissionItem = ({ title, date, url, status, grade, onGrade }) => (
  <div className="flex items-center justify-between p-6 bg-white border border-slate-50 rounded-[2rem] hover:shadow-xl transition-all group">
    <div className="flex items-center gap-5">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${status === 'Late' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-600'}`}>
        <FaFilePdf />
      </div>
      <div>
        <h4 className="font-black text-slate-800 text-sm">{title}</h4>
        <p className="text-[10px] font-black text-slate-400 mt-1 uppercase flex items-center gap-2"><FaClock /> {new Date(date).toLocaleString()}</p>
      </div>
    </div>
    
    <div className="flex items-center gap-3">
      {grade ? (
        <span className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase">
          Score: {grade}
        </span>
      ) : (
        <span className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase ${status === 'Late' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
          {status}
        </span>
      )}

      {onGrade && (
        <button 
          onClick={onGrade}
          className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
          title="Evaluate Submission"
        >
          <FaStar size={14} />
        </button>
      )}

      <a href={url} target="_blank" rel="noreferrer" className="w-10 h-10 bg-white border-2 border-slate-100 text-slate-400 rounded-xl flex items-center justify-center hover:border-blue-500 hover:text-blue-600 transition-all">
        <FaExternalLinkAlt size={12} />
      </a>
    </div>
  </div>
);

const SidebarLink = ({ icon, label, active, onClick }) => (
  <div onClick={onClick} className={`flex items-center gap-4 px-6 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all cursor-pointer ${
    active ? 'bg-slate-900 text-white shadow-2xl' : 'text-slate-400 hover:bg-gray-50'
  }`}>
    <span className="text-xl">{icon}</span>
    <span>{label}</span>
  </div>
);

export default SupervisorDashboard;