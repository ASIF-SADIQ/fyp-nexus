import React from 'react';
import { 
  FaTimes, FaProjectDiagram, FaUserTie, FaClock, 
  FaCommentDots, FaGithub, FaLinkedin, FaGlobe, 
  FaEnvelope, FaIdCard, FaUserGraduate, FaCode,
  FaQuoteLeft, FaTerminal, FaShieldAlt, FaCalendarCheck,
  FaCircle, FaExternalLinkAlt, FaAward, FaFileSignature,
  FaCheckDouble, FaExclamationTriangle
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const DeepDiveModal = ({ isOpen, onClose, type, data }) => {
  // ✅ Extract data safely without early returning (to preserve exit animations)
  const project = data?.project;
  const deadlines = data?.deadlines;
  const member = type === 'member' ? data : null;

  const renderContent = () => {
    switch (type) {
      /* --- 1. MEMBER PROFILE --- */
      case 'member':
        return (
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm text-center relative overflow-hidden">
                <div className="relative inline-block z-10">
                  <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[2rem] flex items-center justify-center text-3xl font-black text-white shadow-xl border-4 border-white">
                    {member?.profilePicture ? (
                      <img src={member.profilePicture} className="w-full h-full object-cover rounded-[2rem]" alt="" />
                    ) : member?.name?.charAt(0)}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center text-white text-[10px]">
                    <FaAward />
                  </div>
                </div>
                <h3 className="text-xl font-black text-slate-900 mt-4 leading-tight">{member?.name}</h3>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">{member?.rollNo}</p>
                <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-blue-50 to-transparent pointer-events-none" />
              </div>

              <div className="flex flex-col gap-3 px-2">
                <SocialLink icon={<FaGithub />} label="GitHub" url={member?.links?.github} activeColor="text-slate-900" />
                <SocialLink icon={<FaLinkedin />} label="LinkedIn" url={member?.links?.linkedin} activeColor="text-blue-700" />
              </div>
            </div>

            <div className="md:col-span-4 space-y-6">
              <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 relative group">
                <FaQuoteLeft className="text-slate-200 absolute top-6 left-6 text-4xl group-hover:text-blue-100 transition-colors" />
                <div className="relative z-10 pl-4">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Professional Bio</h4>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                    {member?.bio || "Node biography pending synchronization."}
                  </p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h4 className="text-[9px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <FaCode className="text-blue-600" /> Technical Capabilities
                </h4>
                <div className="flex flex-wrap gap-2">
                  {member?.skills?.map((skill, i) => (
                    <span key={i} className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-black text-slate-600 uppercase shadow-sm tracking-wider hover:border-blue-200 transition-colors">
                      {skill}
                    </span>
                  )) || <span className="text-xs text-slate-300 italic">No skills listed.</span>}
                </div>
              </div>
            </div>
          </div>
        );

      /* --- 2. PROJECT STATS --- */
      case 'project':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BentoBox label="Project Domain" value={project?.domain} icon={<FaProjectDiagram />} color="text-blue-600" />
              <BentoBox label="Tech Infrastructure" value={project?.technologies} icon={<FaTerminal />} color="text-indigo-600" />
            </div>
            <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-all" />
               <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-4">Executive Abstract</h4>
               <p className="text-slate-300 text-sm leading-relaxed font-medium">
                 {project?.description || "Project parameters have not been defined."}
               </p>
            </div>
          </div>
        );

      /* --- 3. TIMELINE / DEADLINES --- */
      case 'deadline':
        return (
          <div className="grid grid-cols-1 gap-4">
            {deadlines?.length > 0 ? deadlines.map((d, i) => (
              <div key={i} className="group flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[2rem] hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all">
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all ${new Date(d.deadlineDate) < new Date() ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600 shadow-inner'}`}>
                    {d.isHardDeadline ? <FaShieldAlt size={18}/> : <FaCalendarCheck size={18}/>}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-sm tracking-tight">{d.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <FaCircle className={`text-[6px] ${new Date(d.deadlineDate) < new Date() ? 'text-slate-300' : 'text-emerald-500 animate-pulse'}`} />
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Due {new Date(d.deadlineDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest ${d.isHardDeadline ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                  {d.isHardDeadline ? 'Locked' : 'Standard'}
                </div>
              </div>
            )) : <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 text-slate-300 font-black text-xs uppercase tracking-[0.2em]">Roadmap Clear</div>}
          </div>
        );

      /* --- 4. TACTICAL FEEDBACK SECTION --- */
      case 'feedback':
        const hasFeedback = project?.adminFeedback || project?.submissions?.some(s => s.feedback);
        
        return (
          <div className="space-y-8 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
            
            {/* A. Global Admin Directive */}
            {project?.adminFeedback && (
              <div className="relative overflow-hidden bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-800 group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                   <FaShieldAlt size={80} className="text-white" />
                </div>
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white animate-pulse">
                        <FaExclamationTriangle size={12} />
                      </div>
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Admin Directive</span>
                   </div>
                   <p className="text-white text-sm font-medium leading-relaxed italic border-l-4 border-blue-600 pl-4">
                     "{project.adminFeedback}"
                   </p>
                </div>
              </div>
            )}

            {/* B. Granular Submission Audits */}
            {project?.submissions?.filter(s => s.feedback).length > 0 && (
               <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2 px-2">
                     <FaFileSignature className="text-slate-300" />
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deliverable Audit Logs</h4>
                  </div>
                  
                  {project.submissions.map((sub, i) => (
                    sub.feedback ? (
                      <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                         <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                                  <FaCheckDouble size={14} />
                               </div>
                               <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Milestone</p>
                                  <h5 className="text-xs font-black text-slate-800">{sub.title}</h5>
                               </div>
                            </div>
                            {sub.marks && (
                               <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase">
                                 Grade: {sub.marks}%
                               </span>
                            )}
                         </div>
                         <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-600 text-xs font-medium leading-relaxed">
                            {sub.feedback}
                         </div>
                      </div>
                    ) : null
                  ))}
               </div>
            )}

            {/* C. Empty State */}
            {!hasFeedback && (
              <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 shadow-sm mb-4">
                    <FaCommentDots size={24} />
                 </div>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No evaluation logs found</p>
                 <p className="text-[10px] text-slate-300 mt-1 font-bold">Feedback will appear here after review</p>
              </div>
            )}
          </div>
        );

      default: return null;
    }
  };

  const titles = {
    project: "Strategic Data",
    supervisor: "Mentorship Core",
    deadline: "Synchronized Pulse",
    feedback: "Evaluation Protocols",
    member: "Node Identity"
  };

  return (
    <AnimatePresence>
      {/* ✅ Render modal inside AnimatePresence based on isOpen AND data */}
      {isOpen && data && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          
          {/* Backdrop Animation */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose} 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
          />
          
          {/* Modal Card Animation */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 10 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.95, opacity: 0, y: 10, transition: { duration: 0.2 } }}
            className="relative bg-white w-full max-w-2xl rounded-[3.5rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.2)] overflow-hidden border border-slate-100"
          >
            {/* Header */}
            <div className="p-10 pb-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-200">
                  {type === 'member' ? <FaIdCard /> : type === 'feedback' ? <FaCommentDots /> : type === 'project' ? <FaProjectDiagram /> : <FaClock />}
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-0.5">Nexus Protocol</p>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{titles[type]}</h2>
                </div>
              </div>
              <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all">
                <FaTimes />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="px-10 pb-10 max-h-[65vh] overflow-y-auto custom-scrollbar">
              {renderContent()}
            </div>

            {/* Footer Actions */}
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
               <button 
                 onClick={onClose}
                 className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl active:scale-95"
               >
                 Close Manifest
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

/* --- Refined Sub-Components --- */

const BentoBox = ({ label, value, icon, color }) => (
  <div className="p-6 bg-white border border-slate-100 rounded-[2.2rem] shadow-sm hover:shadow-md transition-all group">
    <div className={`flex items-center gap-3 ${color} mb-3`}>
       <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">{icon}</div>
       <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">{label}</p>
    </div>
    <p className="text-xs font-black text-slate-800 leading-tight">{value || 'N/A'}</p>
  </div>
);

const SocialLink = ({ icon, label, url, activeColor }) => (
  <a 
    href={url || '#'} 
    target={url ? "_blank" : "_self"} 
    rel="noreferrer"
    className={`flex items-center justify-between p-4 rounded-2xl border border-slate-100 transition-all group ${!url ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:bg-slate-50 hover:border-blue-200'}`}
  >
    <div className="flex items-center gap-3">
      <span className={`text-lg ${url ? activeColor : 'text-slate-300'}`}>{icon}</span>
      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{label}</span>
    </div>
    {url && <FaExternalLinkAlt className="text-slate-200 group-hover:text-blue-400 transition-all" size={10} />}
  </a>
);

export default DeepDiveModal;