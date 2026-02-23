import React, { useState } from "react";
import toast from 'react-hot-toast'; // ✅ Added for premium alerts
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaFilePdf, FaUsers, FaGithub, FaLinkedin, 
  FaArrowRight, FaTimes, FaCheckCircle, FaExclamationCircle, FaSpinner 
} from "react-icons/fa";
import api from "../../services/api";
import ActionConfirmModal from '../shared/ActionConfirmModal'; // ✅ Implemented custom modal

const ActiveProjectCard = ({ project, refreshDashboard }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [updating, setUpdating] = useState(false);

  // ✅ State for custom confirmation modal
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    type: 'primary',
    onConfirm: () => {}
  });

  // ✅ Triggered when Supervisor clicks "Mark Completed"
  const handleInitiateCompletion = () => {
    setConfirmConfig({
      isOpen: true,
      title: "Confirm Project Completion",
      message: "Are you sure you want to mark this project as completed? This action will archive the project and release one slot in your active mentorship workload.",
      confirmText: "Archive Project",
      type: "success", // Gives the modal a green success theme
      onConfirm: executeCompletion
    });
  };

  /**
   * ✅ Executes the API call after confirmation
   */
  const executeCompletion = async () => {
    try {
      setUpdating(true);
      await api.put(`/projects/${project._id}/status`, { status: "Completed" });
      
      toast.success("Project archived. Workload capacity increased."); // ✅ Replaced alert()
      setShowDetails(false); // Close the detail modal
      
      if (refreshDashboard) refreshDashboard(); // Refresh the parent dashboard lists
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update project status."); // ✅ Replaced alert()
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <motion.div 
        whileHover={{ y: -5 }}
        className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer group"
        onClick={() => setShowDetails(true)}
      >
        <div className="flex justify-between items-start mb-4">
          <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
            {project.status} Project
          </span>
          <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
            <FaArrowRight size={12} />
          </div>
        </div>

        <h3 className="text-lg font-black text-gray-800 mb-4 leading-tight group-hover:text-blue-600 transition-colors">
          {project.title}
        </h3>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
            <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center">
              <FaUsers size={10} className="text-gray-400" />
            </div>
            {project.members?.length} Team Members
          </div>
          
          <div className="flex -space-x-2 overflow-hidden py-1">
            {project.members?.map((m, i) => (
              <div key={i} title={m.name} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-blue-100 items-center justify-center text-[10px] font-black text-blue-600 overflow-hidden shadow-sm">
                {m.profilePicture ? (
                   <img src={m.profilePicture} alt={m.name} className="h-full w-full object-cover" />
                ) : m.name.charAt(0)}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* --- PROJECT OVERLAY --- */}
      <AnimatePresence>
        {showDetails && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-gray-900/60 backdrop-blur-sm"
            onClick={() => setShowDetails(false)} // Close on backdrop click
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
              className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl relative custom-scrollbar"
            >
              <button 
                onClick={() => setShowDetails(false)}
                className="absolute top-8 right-8 p-4 bg-gray-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all z-10"
              >
                <FaTimes />
              </button>

              <div className="p-8 md:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  
                  {/* Left: Team Info */}
                  <div className="lg:col-span-2 space-y-8">
                    <div>
                      <p className="text-blue-600 font-black text-xs uppercase tracking-widest mb-2">Active Supervision</p>
                      <h2 className="text-4xl font-black text-gray-900 leading-tight">{project.title}</h2>
                    </div>

                    <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
                      <h4 className="text-xs font-black uppercase text-gray-400 mb-6 tracking-widest">Team Members</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {project.members?.map(m => (
                          <div key={m._id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4 mb-4">
                               <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center font-black text-blue-600 overflow-hidden shadow-inner">
                                 {m.profilePicture ? <img src={m.profilePicture} className="w-full h-full object-cover" alt={m.name} /> : m.name.charAt(0)}
                               </div>
                               <div>
                                 <p className="font-black text-gray-800 text-sm leading-none">{m.name}</p>
                                 <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tight">{m.rollNo}</p>
                               </div>
                            </div>
                            <p className="text-xs text-gray-500 font-medium italic mb-4 line-clamp-2 leading-relaxed">
                              {m.bio || "No professional bio provided."}
                            </p>
                            <div className="flex gap-2 border-t border-gray-50 pt-4">
                               {m.githubUrl && (
                                 <a href={m.githubUrl} target="_blank" rel="noreferrer" className="p-2.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition"><FaGithub size={14}/></a>
                               )}
                               {m.linkedinUrl && (
                                 <a href={m.linkedinUrl} target="_blank" rel="noreferrer" className="p-2.5 bg-gray-50 text-blue-600 rounded-xl hover:bg-blue-100 transition"><FaLinkedin size={14}/></a>
                               )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="space-y-6">
                    <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white shadow-xl">
                      <h4 className="text-[10px] font-black uppercase opacity-50 tracking-widest mb-6">Project Control</h4>
                      
                      <a 
                        href={project.proposalDocument}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-3 w-full py-5 bg-white/10 hover:bg-white/20 rounded-2xl font-black text-xs uppercase tracking-widest transition-all mb-4 border border-white/5"
                      >
                        <FaFilePdf className="text-red-400 text-lg" /> Proposal PDF
                      </a>

                      <div className="space-y-3 pt-4 border-t border-white/10">
                        <p className="text-[10px] font-black uppercase opacity-50 tracking-widest mb-2">Cycle Management</p>
                        <button 
                          disabled={updating || project.status === 'Completed'}
                          onClick={handleInitiateCompletion} // ✅ Uses the custom modal
                          className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:bg-gray-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
                        >
                          {updating ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />} 
                          {updating ? "Processing..." : project.status === 'Completed' ? "Project Completed" : "Mark Completed"}
                        </button>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
                       <div className="flex items-center gap-2 mb-2">
                         <FaExclamationCircle className="text-blue-600" />
                         <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Details</p>
                       </div>
                       <div className="space-y-2 mt-4">
                         <p className="text-[10px] text-blue-800 font-bold uppercase tracking-widest">DOMAIN</p>
                         <p className="font-black text-sm text-blue-900 mb-4">{project.domain}</p>
                         
                         <p className="text-[10px] text-blue-800 font-bold uppercase tracking-widest">TECH STACK</p>
                         <p className="font-black text-sm text-blue-900 leading-tight">{project.technologies || "N/A"}</p>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Action Confirmation Modal Rendered Here */}
      <ActionConfirmModal 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        type={confirmConfig.type}
      />
    </>
  );
};

export default ActiveProjectCard;