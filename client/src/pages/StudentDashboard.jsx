import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaClock, FaProjectDiagram, FaCalendarAlt, 
  FaLock, FaUnlock, FaChevronRight, FaChartLine, FaMagic 
} from "react-icons/fa";
import api from "../services/api";

// --- COMPONENTS ---
import StudentSidebar from "../components/student/StudentSidebar";
import StatsRow from "../components/student/StatsRow";
import OverviewTab from "../components/student/OverviewTab";
import ProposalTab from "../components/student/ProposalTab";
import DocumentTab from "../components/student/DocumentTab";
import ProfileTab from "../components/student/ProfileTab"; 
import SupervisorSelectionTab from '../components/student/SupervisorSelectionTab';
import DeadlineCard from "../components/student/DeadlineCard"; 
import NotificationsTab from "../components/student/NotificationsTab";
import DeepDiveModal from "../components/student/DeepDiveModal"; 

// ✅ SHARED ANALYTICS & AI COMPONENTS
import ProjectAnalytics from "../components/shared/ProjectAnalytics";
import RoadmapGenerator from "../components/shared/RoadmapGenerator";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [project, setProject] = useState(null);
  const [deadlines, setDeadlines] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isDeepDiveOpen, setIsDeepDiveOpen] = useState(false);
  const [deepDiveType, setDeepDiveType] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  /**
   * ✅ Defensive Data Sync
   */
  const fetchData = useCallback(async () => {
    if (!userInfo?._id) return;
    try {
      const [projRes, notifyRes, deadlineRes] = await Promise.allSettled([
        api.get("/projects/my"),
        api.get("/notifications/my"),
        api.get("/deadlines/my")
      ]);
      
      const projData = projRes.status === "fulfilled" ? projRes.value.data : null;
      setProject(Array.isArray(projData) ? projData[0] : (projData ?? null));
      
      setNotifications(notifyRes.status === "fulfilled" ? (notifyRes.value.data ?? []) : []);
      setDeadlines(deadlineRes.status === "fulfilled" ? (deadlineRes.value.data ?? []) : []);
      
    } catch (error) { 
      console.error("Dashboard Sync Error:", error); 
    } finally { 
      setLoading(false); 
    }
  }, [userInfo?._id]);

  /**
   * ✅ NEXT MILESTONE LOGIC
   */
  const nextMilestone = useMemo(() => {
    if (!deadlines || deadlines.length === 0) return null;
    
    const now = new Date();
    const pendingUpcoming = [...deadlines]
      .filter(d => {
        const isFuture = new Date(d.deadlineDate) > now;
        const isAlreadySubmitted = project?.submissions?.some(s => s.deadlineId === d._id);
        return isFuture && !isAlreadySubmitted;
      })
      .sort((a, b) => new Date(a.deadlineDate) - new Date(b.deadlineDate));

    return pendingUpcoming.length > 0 ? pendingUpcoming[0] : null;
  }, [deadlines, project]);

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
    } else {
      fetchData();
    }
  }, [fetchData, navigate]);

  const handleRefresh = async () => {
    await fetchData(); 
  };

  const handleOpenDeepDive = (type) => {
    setDeepDiveType(type);
    setIsDeepDiveOpen(true);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#F4F7FE]">
      <div className="flex flex-col items-center gap-4">
        <div className="text-blue-600 font-black animate-bounce tracking-tighter text-3xl">
          NEXUS<span className="text-slate-800">.</span>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Loading Workspace...</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F4F7FE] font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <StudentSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        project={project} 
      />
      
      <main className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
        {/* HEADER */}
        <header className="flex justify-between items-center mb-10">
          <div className="flex flex-col">
              <h2 className="text-2xl font-black text-slate-900 capitalize tracking-tight">
                {activeTab === "supervisor" ? "Mentor Selection" : activeTab.replace("-", " ")}
              </h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                Student Portal • {userInfo?.batch || '2026'}
              </p>
          </div>
          <div className="bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-gray-100 font-bold text-xs flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black shadow-lg shadow-blue-100">
                {userInfo?.name?.[0]}
            </div>
            <span className="text-slate-700 hidden sm:block">{userInfo?.name}</span>
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          
          {/* --- 1. OVERVIEW TAB --- */}
          {activeTab === "overview" && (
            <div className="space-y-10">
              {!project ? (
                <div className="flex flex-col items-center justify-center h-[50vh] bg-white rounded-[3rem] border-2 border-dashed border-gray-100 p-10 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <FaProjectDiagram size={30} className="text-slate-200" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800">Initiate Your Journey</h3>
                  <p className="text-gray-400 mb-8 max-w-sm text-sm">No active project found. Submit your proposal to begin the FYP process.</p>
                  <button 
                    onClick={() => setActiveTab("proposal")}
                    className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-600 transition-all active:scale-95"
                  >
                    Create New Proposal
                  </button>
                </div>
              ) : (
                <>
                  <StatsRow 
                    project={project} 
                    deadlines={deadlines} 
                    onOpenDeepDive={handleOpenDeepDive} 
                  />
                  
                  {nextMilestone && (
                    <section className="space-y-4 max-w-4xl">
                       <div className="flex justify-between items-center px-4">
                          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Major Goal</h3>
                          <button onClick={() => setActiveTab('deadlines')} className="text-blue-600 text-[10px] font-black uppercase flex items-center gap-1 hover:gap-2 transition-all">
                             Full Roadmap <FaChevronRight />
                          </button>
                       </div>
                       <DeadlineCard 
                         deadlines={[nextMilestone]} 
                         project={project}
                         onRefresh={handleRefresh}
                       />
                    </section>
                  )}

                  <OverviewTab 
                     project={project} 
                     deadlines={deadlines} 
                     notifications={notifications} 
                     setActiveTab={setActiveTab} 
                  />
                </>
              )}
            </div>
          )}

          {/* --- 2. DEADLINES TAB --- */}
          {activeTab === "deadlines" && (
            <div className="space-y-8 max-w-5xl">
               <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex justify-between items-center relative overflow-hidden">
                 <div className="relative z-10">
                    <h3 className="text-2xl font-black tracking-tight">Academic Roadmap</h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                      {deadlines?.length || 0} Milestones Synchronized
                    </p>
                 </div>
                 <FaCalendarAlt size={60} className="absolute -right-4 -bottom-4 text-white/5" />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {deadlines?.map((deadline) => {
                    const isNext = nextMilestone && deadline._id === nextMilestone._id;
                    const isExpired = new Date(deadline.deadlineDate) < new Date();
                    const isSubmitted = project?.submissions?.some(s => s.deadlineId === deadline._id);

                    return (
                      <div 
                        key={deadline._id}
                        className={`p-8 rounded-[2.5rem] bg-white border transition-all relative
                          ${isNext ? 'border-next-up' : 'border-slate-50 shadow-sm'}
                          ${(isExpired || isSubmitted) ? 'opacity-50 grayscale' : 'hover:shadow-xl'}
                        `}
                      >
                        <div className="flex justify-between items-start mb-6">
                           <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest
                            ${isSubmitted ? 'bg-emerald-500 text-white' : isNext ? 'bg-yellow-400 text-slate-900' : 'bg-slate-50 text-slate-400'}
                           `}>
                            {isSubmitted ? "Submitted" : isNext ? "⭐ Up Next" : deadline.scope}
                           </span>
                           {deadline.isHardDeadline ? <FaLock size={12} className="text-slate-200" /> : <FaUnlock size={12} className="text-slate-200" />}
                        </div>

                        <h3 className="text-lg font-black text-slate-900 mb-1">{deadline.title}</h3>
                        <p className="text-slate-400 text-[10px] font-medium line-clamp-1">
                          {deadline.description || "Refer to project guidelines for details."}
                        </p>

                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-50">
                           <div className="flex items-center gap-2">
                              <FaClock size={12} className="text-slate-300" />
                              <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">
                                {new Date(deadline.deadlineDate).toLocaleDateString()}
                              </span>
                           </div>
                        </div>
                      </div>
                    );
                  })}
               </div>
            </div>
          )}
          
          {/* ✅ TRACKER TAB (Progress Analytics) */}
          {activeTab === "tracker" && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
               {project ? (
                 <ProjectAnalytics 
                   project={project} 
                   onRefresh={handleRefresh} 
                 />
               ) : (
                 <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-xs">
                   No project data available for analysis.
                 </div>
               )}
            </div>
          )}

          {/* ✅ ROADMAP TAB (AI Generator) */}
          {activeTab === "roadmap" && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
               {project ? (
                 <RoadmapGenerator 
                   projectId={project._id} 
                   onRefresh={handleRefresh} 
                 />
               ) : (
                 <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-xs">
                   Submit a proposal first to generate an AI Roadmap.
                 </div>
               )}
            </div>
          )}

          {activeTab === "notifications" && (
            <NotificationsTab />
          )}

          {/* --- PROPOSAL TAB --- */}
          {activeTab === "proposal" && (
            <div>
              {project && ["Approved", "Ongoing", "Completed"].includes(project.status) ? (
                <div className="bg-white p-12 rounded-[2.5rem] text-center border border-amber-100 shadow-sm max-w-2xl mx-auto mt-10">
                  <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaClock size={24} />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Active Project Found</h3>
                  <p className="text-slate-400 text-xs mt-2">You already have an ongoing project. Use the Roadmap tab to plan tasks.</p>
                  <button onClick={() => setActiveTab("roadmap")} className="mt-8 bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2 mx-auto">
                    <FaMagic /> Go to AI Roadmap
                  </button>
                </div>
              ) : (
                <ProposalTab fetchData={handleRefresh} />
              )}
            </div>
          )}

          {activeTab === "supervisor" && (
            <SupervisorSelectionTab 
              project={project} 
              refreshProject={handleRefresh} 
              onLocalRequest={() => {}} 
            />
          )}

          {activeTab === "documents" && (
            <DocumentTab 
              project={project} 
              deadlines={deadlines} 
              onRefresh={handleRefresh}
            />
          )}
          
          {activeTab === "profile" && (
            <ProfileTab 
              userInfo={project?.members?.find(m => m._id === userInfo?._id) || userInfo} 
              onUpdate={handleRefresh} 
            />
          )}
        </div>
      </main>

      {/* Global Modals */}
      <DeepDiveModal 
        isOpen={isDeepDiveOpen}
        onClose={() => setIsDeepDiveOpen(false)}
        type={deepDiveType}
        data={{ project, deadlines }}
      />
    </div>
  );
};

export default StudentDashboard;