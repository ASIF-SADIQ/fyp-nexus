import React, { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaCheck, FaTimes, FaInbox, FaProjectDiagram, 
  FaCalendarAlt, FaFileAlt, FaSpinner, FaArrowRight 
} from "react-icons/fa";
import api from "../../services/api";

const SupervisionRequests = ({ userInfo, refreshDashboard }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/projects/supervisor/dashboard");
      setRequests(data.pendingRequests || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to fetch pending invitations.");
    } finally {
      setLoading(false);
    }
  };

  const getSpecificRequestInfo = (reqArray) => {
    return reqArray?.find(r => 
      r.teacherId === userInfo._id || r.teacherId?._id === userInfo._id
    );
  };

  const handleAction = async (projectId, action) => {
    try {
      setProcessingId(projectId);
      const response = await api.put(`/projects/${projectId}/respond-request`, { action });

      if (response.status === 200) {
        toast.success(action === 'Accept' ? "Group accepted! Redirecting..." : "Invitation declined.");
        setRequests(prev => prev.filter(r => r._id !== projectId));
        if (refreshDashboard) refreshDashboard();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return (
    <div className="p-12 flex flex-col items-center justify-center gap-4">
      <FaSpinner className="text-orange-400 animate-spin text-2xl" />
      <p className="text-slate-400 font-black uppercase text-[9px] tracking-[0.3em] animate-pulse">
        Synchronizing Invitations...
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
          <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">
            Supervision Requests ({requests.length})
          </h3>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {requests.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="p-16 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-center shadow-sm"
          >
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <FaInbox className="text-slate-200 text-xl" />
            </div>
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest italic">Inbox is currently empty</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {requests.map((project) => {
              const myRequest = getSpecificRequestInfo(project.supervisionRequests);
              const isProcessing = processingId === project._id;
              
              return (
                <motion.div
                  key={project._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-orange-500/5 transition-all relative overflow-hidden group"
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
                    
                    <div className="flex-1 space-y-4 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="bg-orange-500 text-white text-[9px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest shadow-lg shadow-orange-200">
                          Pending Invitation
                        </span>
                        <span className="text-slate-300 text-[10px] flex items-center gap-1.5 font-black uppercase">
                          <FaCalendarAlt size={10} /> Sent {new Date(myRequest?.requestDate || project.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h4 className="text-2xl font-black text-slate-900 leading-[1.1] tracking-tight group-hover:text-orange-600 transition-colors">
                        {project.title}
                      </h4>
                      
                      <div className="flex flex-wrap gap-6 pt-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-sm border border-blue-100">
                            {project.leader?.name?.[0]}
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Group Leader</p>
                            <p className="text-xs font-bold text-slate-700">{project.leader?.name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center border border-slate-100">
                            <FaProjectDiagram size={14} />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Research Domain</p>
                            <p className="text-xs font-bold text-slate-700">{project.domain}</p>
                          </div>
                        </div>

                        {/* Proposal Preview Action */}
                        {project.proposalDocument && (
                           <a 
                             href={project.proposalDocument} 
                             target="_blank" 
                             rel="noreferrer"
                             className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 group/link"
                           >
                             <FaFileAlt size={10}/>
                             <span className="text-[9px] font-black uppercase tracking-widest">View Proposal</span>
                           </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto shrink-0 border-t lg:border-t-0 border-slate-50 pt-6 lg:pt-0">
                      <button
                        disabled={isProcessing}
                        onClick={() => handleAction(project._id, 'Reject')}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-slate-50 text-slate-400 px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95 disabled:opacity-50"
                      >
                        <FaTimes size={12} /> Decline
                      </button>
                      <button
                        disabled={isProcessing}
                        onClick={() => handleAction(project._id, 'Accept')}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {isProcessing ? <FaSpinner className="animate-spin" /> : <FaCheck size={12} />}
                        Accept Group
                      </button>
                    </div>
                  </div>
                  
                  {/* Decorative Background Icon */}
                  <FaInbox size={150} className="absolute -right-10 -bottom-10 text-slate-50/50 pointer-events-none -rotate-12 group-hover:text-orange-50 transition-colors" />
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupervisionRequests;