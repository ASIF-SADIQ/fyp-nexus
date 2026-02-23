import React, { useState } from 'react';
import { FaFolderOpen, FaArrowLeft, FaUserTie, FaUser } from 'react-icons/fa';
import ProjectAnalytics from '../shared/ProjectAnalytics'; 

const StudentProgressView = ({ projects, refreshData }) => {
  // 1. Holds the ID of the group the supervisor clicks on
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // 2. Isolates ONLY the data for the clicked group
  const selectedProject = projects?.find(p => p._id === selectedProjectId);

  // -----------------------------------------------------------------
  // DETAIL VIEW: The Specific Group's Tracker
  // -----------------------------------------------------------------
  if (selectedProject) {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
        <button 
          onClick={() => setSelectedProjectId(null)}
          className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <FaArrowLeft /> Back to All Groups
        </button>
        
        {/* We pass ONLY the selectedProject here. It isolates the tracking data! */}
        <ProjectAnalytics 
          project={selectedProject} 
          onRefresh={refreshData} 
        />
      </div>
    );
  }

  // -----------------------------------------------------------------
  // MASTER VIEW: The Grid of Project Cards
  // -----------------------------------------------------------------
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Student Progress Overview</h2>
        <p className="text-sm text-slate-500 font-medium mt-1">Select a group card to monitor their specific tasks and progress.</p>
      </div>

      {!projects || projects.length === 0 ? (
        <div className="text-center py-16 text-slate-400 font-bold italic">
          No student teams have been assigned to you yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => {
            // Calculate Progress Bar
            const total = proj.tasks?.length || 0;
            const completed = proj.tasks?.filter(t => t.status === 'Done').length || 0;
            const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

            return (
              <div 
                key={proj._id} 
                onClick={() => setSelectedProjectId(proj._id)}
                className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <FaFolderOpen size={20} />
                  </div>
                  <div>
                     {/* PROJECT TITLE */}
                    <h3 className="text-lg font-black text-slate-800 line-clamp-2 leading-tight">{proj.title}</h3>
                  </div>
                </div>
                
                {/* GROUP MEMBER NAMES */}
                <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 mt-2 space-y-2">
                   {/* Leader Name */}
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                     <FaUserTie className="text-blue-500" /> 
                     <span className="truncate">{proj.leader?.name || "Unknown Leader"}</span>
                   </div>
                   
                   {/* Member Names */}
                   {proj.members?.map((member, idx) => (
                     <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-500 pl-1">
                       <FaUser className="text-slate-300 text-[10px]" /> 
                       <span className="truncate">{member?.name || "Unknown Member"}</span>
                     </div>
                   ))}
                </div>
                
                {/* PROGRESS BAR */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    <span>Task Progress</span>
                    <span className="text-blue-600">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentProgressView;