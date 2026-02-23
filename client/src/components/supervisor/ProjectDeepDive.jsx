import React from 'react';
import { 
  FaFilePdf, FaExternalLinkAlt, FaClock, 
  FaChevronLeft, FaCode, FaStar, FaProjectDiagram 
} from 'react-icons/fa';
import ProjectAnalytics from '../shared/ProjectAnalytics';
import { motion } from 'framer-motion';

const ProjectDeepDive = ({ project, onBack, onRefresh }) => {
  if (!project) return null;

  // Filter to ensure unique members and leader priority
  const teamList = [
    project.leader, 
    ...project.members.filter(m => m._id !== project.leader?._id)
  ].filter(Boolean);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* 🔙 BACK HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-100 shadow-sm">
            <FaChevronLeft />
          </div>
          Return to assigned groups
        </button>

        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <FaProjectDiagram className="text-blue-500" />
          Project ID: <span className="text-slate-900">{project._id.slice(-6)}</span>
        </div>
      </div>

      {/* 🏢 HERO SECTION */}
      <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-6">
             <span className="bg-blue-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/50">
               Project Deep Dive
             </span>
             <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
               project.status === 'Completed' ? 'bg-emerald-500/20 border-emerald-500/20 text-emerald-400' : 'bg-white/10 border-white/5 text-slate-300'
             }`}>
               {project.status}
             </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight max-w-3xl leading-[1.1]">{project.title}</h2>
          <p className="text-slate-400 mt-6 text-sm md:text-base max-w-2xl leading-relaxed italic font-medium">
            {project.description || "No project description provided."}
          </p>
        </div>
        {/* Large Background Decorative Icon */}
        <FaCode size={240} className="absolute -right-10 -bottom-10 text-white/[0.03] pointer-events-none rotate-12" />
      </div>

      {/* 📊 PERFORMANCE ANALYTICS */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12"
      >
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Growth & Activity Analytics</h3>
        </div>
        <ProjectAnalytics project={project} onRefresh={onRefresh} isSupervisor={true} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 👥 LEFT: TEAM & STACK */}
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Development Stack</h3>
            <div className="flex flex-wrap gap-2">
              {project.technologies ? project.technologies.split(',').map((tech, i) => (
                <span key={i} className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-600 border border-slate-100 uppercase hover:border-blue-200 hover:text-blue-600 transition-colors cursor-default">
                  {tech.trim()}
                </span>
              )) : <p className="text-xs text-slate-400 font-bold">No tech stack listed</p>}
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Group Members</h3>
            <div className="space-y-5">
                {teamList.map((member) => (
                  <div key={member._id} className="flex items-center justify-between group">
                     <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-50 to-slate-50 text-blue-600 border border-blue-100 flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-110 transition-transform">
                           {member.profilePicture ? (
                             <img src={member.profilePicture} alt="" className="w-full h-full object-cover rounded-2xl" />
                           ) : member.name[0]}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800">{member.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{member.rollNo}</p>
                        </div>
                     </div>
                     {member._id === project.leader?._id && (
                       <span className="text-[8px] font-black text-blue-500 bg-blue-50 px-2 py-1 rounded-lg uppercase border border-blue-100/50">Leader</span>
                     )}
                  </div>
                ))}
            </div>
          </section>
        </div>

        {/* 📁 RIGHT: SUBMISSIONS LEDGER */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between px-4">
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Submissions Ledger</h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                  {project.submissions?.length + 1 || 1} Total Assets
                </p>
              </div>
           </div>

           <div className="space-y-4">
              {/* 1. Initial Proposal */}
              <SubmissionItem 
                title="Official Project Proposal" 
                date={project.createdAt} 
                url={project.proposalDocument} 
                status="Archived" 
              />

              {/* 2. Dynamic Roadmap Submissions */}
              {project.submissions && project.submissions.length > 0 ? (
                [...project.submissions].reverse().map((sub, index) => (
                  <SubmissionItem 
                    key={sub._id || index}
                    title={sub.title} 
                    date={sub.submittedAt} 
                    url={sub.fileUrl} 
                    status={sub.status} 
                    marks={sub.marks}
                  />
                ))
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem] bg-white/50">
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                     <FaFilePdf className="text-slate-200" size={24} />
                   </div>
                   <p className="text-slate-300 font-black uppercase text-[10px] tracking-widest">Awaiting First Deliverable...</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

// Internal Sub-component for Rows
const SubmissionItem = ({ title, date, url, status, marks }) => (
  <motion.div 
    whileHover={{ y: -2 }}
    className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[2.5rem] hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
  >
    <div className="flex items-center gap-5">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner transition-all ${
        status === 'Late' ? 'bg-amber-50 text-amber-500' : 
        status === 'Archived' ? 'bg-slate-50 text-slate-400' : 'bg-blue-50 text-blue-600'
      }`}>
        <FaFilePdf />
      </div>
      <div>
        <h4 className="font-black text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{title}</h4>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
          <FaClock size={10} className="text-slate-300" /> {new Date(date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
        </p>
      </div>
    </div>

    <div className="flex items-center gap-4">
      {/* Grade Badge if exists */}
      {marks !== undefined && marks !== null && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
          <FaStar size={10} />
          <span className="text-[10px] font-black">{marks}/100</span>
        </div>
      )}

      <span className={`hidden md:block px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border ${
        status === 'Late' ? 'bg-rose-50 border-rose-100 text-rose-500' : 
        status === 'Archived' ? 'bg-slate-50 border-slate-100 text-slate-400' : 'bg-blue-50 border-blue-100 text-blue-600'
      }`}>
        {status}
      </span>

      <a 
        href={url} 
        target="_blank" 
        rel="noreferrer"
        className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-all shadow-lg hover:shadow-blue-500/20 active:scale-90"
      >
        <FaExternalLinkAlt size={14} />
      </a>
    </div>
  </motion.div>
);

export default ProjectDeepDive;