import React from 'react';
import { 
  FaTimes, FaProjectDiagram, FaUserTie, FaClock, 
  FaCommentDots, FaGithub, FaLinkedin, FaGlobe, 
  FaEnvelope, FaIdCard, FaUserGraduate, FaCode,
  FaQuoteLeft, FaTerminal, FaShieldAlt, FaCalendarCheck,
  FaCircle, FaExternalLinkAlt, FaAward, FaFileSignature,
  FaCheckDouble, FaExclamationTriangle, FaStar
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
              <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm text-center relative overflow-hidden">
                <div className="relative inline-block z-10">
                  <div className="w-24 h-24 bg-gradient-to-tr from-primary-600 to-indigo-600 rounded-3xl flex items-center justify-center text-3xl font-black text-white shadow-xl border-4 border-white">
                    {member?.profilePicture ? (
                      <img src={member.profilePicture} className="w-full h-full object-cover rounded-3xl" alt="" />
                    ) : member?.name?.charAt(0)}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-success-500 border-4 border-white rounded-full flex items-center justify-center text-white text-xs">
                    <FaAward />
                  </div>
                </div>
                <h3 className="text-xl font-black text-neutral-900 mt-4 leading-tight">{member?.name}</h3>
                <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mt-1">{member?.rollNo}</p>
                <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-primary-50 to-transparent pointer-events-none" />
              </div>

              <div className="flex flex-col gap-3 px-2">
                <SocialLink icon={<FaGithub />} label="GitHub" url={member?.links?.github} activeColor="text-neutral-900" />
                <SocialLink icon={<FaLinkedin />} label="LinkedIn" url={member?.links?.linkedin} activeColor="text-primary-700" />
              </div>
            </div>

            <div className="md:col-span-4 space-y-6">
              <div className="bg-neutral-50/50 p-8 rounded-3xl border border-neutral-100 relative group">
                <FaQuoteLeft className="text-neutral-200 absolute top-6 left-6 text-4xl group-hover:text-primary-100 transition-colors" />
                <div className="relative z-10 pl-4">
                  <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-3">Professional Bio</h4>
                  <p className="text-sm text-neutral-600 leading-relaxed font-medium italic">
                    {member?.bio || "Node biography pending synchronization."}
                  </p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm">
                <h4 className="text-xs font-black text-neutral-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FaCode className="text-primary-600" /> Technical Capabilities
                </h4>
                <div className="flex flex-wrap gap-2">
                  {member?.skills?.map((skill, i) => (
                    <span key={i} className="px-4 py-2 bg-white border border-neutral-100 rounded-2xl text-xs font-black text-neutral-600 uppercase shadow-sm tracking-wider hover:border-primary-200 transition-colors">
                      {skill}
                    </span>
                  )) || <span className="text-xs text-neutral-300 italic">No skills listed.</span>}
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
              <BentoBox label="Project Domain" value={project?.domain} icon={<FaProjectDiagram />} color="text-primary-600" />
              <BentoBox label="Tech Infrastructure" value={project?.technologies} icon={<FaTerminal />} color="text-indigo-600" />
            </div>
            <div className="bg-neutral-900 p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary-500/20 transition-all" />
               <h4 className="text-xs font-black text-primary-400 uppercase tracking-widest mb-4">Executive Abstract</h4>
               <p className="text-neutral-300 text-sm leading-relaxed font-medium">
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
              <div key={i} className="group flex items-center justify-between p-6 bg-white border border-neutral-100 rounded-2xl hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/5 transition-all">
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all ${new Date(d.deadlineDate) < new Date() ? 'bg-neutral-100 text-neutral-400' : 'bg-primary-50 text-primary-600 shadow-inner'}`}>
                    {d.isHardDeadline ? <FaShieldAlt size={18}/> : <FaCalendarCheck size={18}/>}
                  </div>
                  <div>
                    <h4 className="font-black text-neutral-900 text-sm tracking-tight">{d.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <FaCircle className={`text-xs ${new Date(d.deadlineDate) < new Date() ? 'text-neutral-300' : 'text-success-500 animate-pulse'}`} />
                      <p className="text-xs font-bold text-neutral-400 uppercase">Due {new Date(d.deadlineDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-2xl text-xs font-black uppercase tracking-widest ${d.isHardDeadline ? 'bg-error-50 text-error-600' : 'bg-neutral-100 text-neutral-500'}`}>
                  {d.isHardDeadline ? 'Locked' : 'Standard'}
                </div>
              </div>
            )) : <div className="text-center py-20 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200 text-neutral-300 font-black text-xs uppercase tracking-widest">Roadmap Clear</div>}
          </div>
        );

      /* --- 4. TACTICAL FEEDBACK SECTION --- */
      case 'feedback':
        // ✅ UPDATED: Now checks for final grade feedback as well
        const hasFeedback = project?.adminFeedback || project?.grade?.feedback || project?.submissions?.some(s => s.feedback);
        
        return (
          <div className="space-y-8 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
            
            {/* A. Global Admin Directive */}
            {project?.adminFeedback && (
              <div className="relative overflow-hidden bg-neutral-900 p-8 rounded-3xl shadow-xl border border-neutral-800 group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                   <FaShieldAlt size={80} className="text-white" />
                </div>
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white animate-pulse">
                        <FaExclamationTriangle size={12} />
                      </div>
                      <span className="text-xs font-black text-primary-400 uppercase tracking-widest">Admin Directive</span>
                   </div>
                   <p className="text-white text-sm font-medium leading-relaxed italic border-l-4 border-primary-600 pl-4">
                      "{project.adminFeedback}"
                   </p>
                </div>
              </div>
            )}

            {/* ✅ NEW: Final Evaluation Feedback */}
            {project?.grade?.feedback && (
              <div className="relative overflow-hidden bg-emerald-50 p-8 rounded-3xl shadow-sm border border-emerald-100">
                <div className="relative z-10">
                   <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-md">
                          <FaStar size={12} />
                        </div>
                        <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Final Evaluation Remarks</span>
                     </div>
                     {project?.grade?.score && (
                       <span className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                         Score: {project.grade.score}/100
                       </span>
                     )}
                   </div>
                   <p className="text-slate-700 text-sm font-medium leading-relaxed italic border-l-4 border-emerald-400 pl-4 bg-white p-4 rounded-xl">
                      "{project.grade.feedback}"
                   </p>
                </div>
              </div>
            )}

            {/* B. Granular Submission Audits */}
            {project?.submissions?.filter(s => s.feedback).length > 0 && (
               <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2 px-2 mt-4">
                     <FaFileSignature className="text-slate-300" />
                     <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Deliverable Audit Logs</h4>
                  </div>
                  
                  {project.submissions.map((sub, i) => (
                    sub.feedback ? (
                      <div key={i} className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-all">
                         <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-2xl bg-success-50 text-success-600 flex items-center justify-center shadow-inner">
                                  <FaCheckDouble size={14} />
                               </div>
                               <div>
                                  <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">Milestone</p>
                                  <h5 className="text-xs font-black text-neutral-900">{sub.title}</h5>
                               </div>
                            </div>
                            {sub.marks && (
                               <span className="px-3 py-1 bg-neutral-900 text-white rounded-lg text-xs font-black uppercase">
                                  Grade: {sub.marks}%
                               </span>
                            )}
                         </div>
                         <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 text-neutral-600 text-xs font-medium leading-relaxed">
                            {sub.feedback}
                         </div>
                      </div>
                    ) : null
                  ))}
               </div>
            )}

            {/* C. Empty State */}
            {!hasFeedback && (
              <div className="flex flex-col items-center justify-center py-20 bg-neutral-50 rounded-3xl border-2 border-dashed border-neutral-200">
                 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-neutral-300 shadow-sm mb-4">
                    <FaCommentDots size={24} />
                 </div>
                 <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">No evaluation logs found</p>
                 <p className="text-xs text-neutral-300 mt-1 font-bold">Feedback will appear here after review</p>
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
      {/* Render modal inside AnimatePresence based on isOpen AND data */}
      {isOpen && data && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          
          {/* Backdrop Animation */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose} 
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-md" 
          />
          
          {/* Modal Card Animation */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 10 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.95, opacity: 0, y: 10, transition: { duration: 0.2 } }}
            className="relative bg-white w-full max-w-2xl rounded-3xl shadow-[0_30px_100px_-20px_rgba(0,0,0,0.2)] overflow-hidden border border-neutral-100"
          >
            {/* Header */}
            <div className="p-10 pb-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-neutral-900 flex items-center justify-center text-white shadow-xl shadow-neutral-200">
                  {type === 'member' ? <FaIdCard /> : type === 'feedback' ? <FaCommentDots /> : type === 'project' ? <FaProjectDiagram /> : <FaClock />}
                </div>
                <div>
                  <p className="text-xs font-black text-primary-600 uppercase tracking-widest mb-0.5">Nexus Protocol</p>
                  <h2 className="text-2xl font-black text-neutral-900 tracking-tight">{titles[type]}</h2>
                </div>
              </div>
              <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-400 hover:bg-error-50 hover:text-error-500 transition-all">
                <FaTimes />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="px-10 pb-10 max-h-[65vh] overflow-y-auto custom-scrollbar">
              {renderContent()}
            </div>

            {/* Footer Actions */}
            <div className="p-8 bg-neutral-50 border-t border-neutral-100 flex gap-4">
               <button 
                 onClick={onClose}
                 className="flex-1 py-4 bg-neutral-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl active:scale-95"
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
  <div className="p-6 bg-white border border-neutral-100 rounded-3xl shadow-sm hover:shadow-md transition-all group">
    <div className={`flex items-center gap-3 ${color} mb-3`}>
       <div className="w-8 h-8 rounded-2xl bg-neutral-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">{icon}</div>
       <p className="text-xs font-black uppercase tracking-widest text-neutral-400 group-hover:text-neutral-900 transition-colors">{label}</p>
    </div>
    <p className="text-xs font-black text-neutral-900 leading-tight">{value || 'N/A'}</p>
  </div>
);

const SocialLink = ({ icon, label, url, activeColor }) => (
  <a 
    href={url || '#'} 
    target={url ? "_blank" : "_self"} 
    rel="noreferrer"
    className={`flex items-center justify-between p-4 rounded-2xl border border-neutral-100 transition-all group ${!url ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:bg-neutral-50 hover:border-primary-200'}`}
  >
    <div className="flex items-center gap-3">
      <span className={`text-lg ${url ? activeColor : 'text-neutral-300'}`}>{icon}</span>
      <span className="text-xs font-black text-neutral-600 uppercase tracking-widest">{label}</span>
    </div>
    {url && <FaExternalLinkAlt className="text-neutral-200 group-hover:text-primary-400 transition-all" size={10} />}
  </a>
);

export default DeepDiveModal;