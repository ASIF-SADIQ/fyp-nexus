import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify'; // ✅ Added premium notifications
import { 
  FaSearch, FaPaperPlane, FaCheckCircle, 
  FaExclamationTriangle, FaInfoCircle, FaLock, FaUserTie 
} from 'react-icons/fa';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import ActionConfirmModal from '../shared/ActionConfirmModal'; // ✅ Added custom modal

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const SupervisorSelectionTab = ({ project, refreshProject, onLocalRequest }) => {
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [requestingId, setRequestingId] = useState(null);

  // ✅ State for custom confirmation modal
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    type: 'primary',
    onConfirm: () => {}
  });

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const { data } = await api.get('/users/supervisors'); 
        setSupervisors(data);
      } catch (error) {
        toast.error("Failed to sync faculty directory.");
      } finally {
        setLoading(false);
      }
    };
    fetchSupervisors();
  }, []);

  const getExistingRequest = (teacherId) => {
    return project?.supervisionRequests?.find(
      (r) => r.teacherId === teacherId || r.teacherId?._id === teacherId
    );
  };

  // ✅ 1. Initiates the modal confirmation
  const handleInviteInitiated = (teacherId, teacherName) => {
    if (project?.supervisor) {
      toast.error("Your project already has an assigned mentor.");
      return;
    }

    setConfirmConfig({
      isOpen: true,
      title: "Request Mentorship",
      message: `Are you sure you want to send a supervision request to Professor ${teacherName}?`,
      confirmText: "Transmit Request",
      type: "primary",
      onConfirm: () => executeInvite(teacherId)
    });
  };

  // ✅ 2. Executes the API call after confirmation
  const executeInvite = async (teacherId) => {
    try {
      setRequestingId(teacherId);
      if (onLocalRequest) onLocalRequest(teacherId); // Optimistic Update
      
      const { data } = await api.put(`/projects/${project._id}/request-supervisor`, { teacherId });
      toast.success("Supervision request transmitted successfully!");
      if (data.project) await refreshProject();
    } catch (error) {
      await refreshProject();
      toast.error(error.response?.data?.message || "Failed to transmit request.");
    } finally {
      setRequestingId(null);
    }
  };

  const filtered = supervisors.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.expertise?.some(e => e.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 animate-pulse">
      <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-6" />
      <div className="text-neutral-400 font-black tracking-widest uppercase text-xs">Syncing Directory...</div>
    </div>
  );

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* Search Header */}
        <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-600 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-primary-200">
              <FaUserTie />
            </div>
            <div>
              <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Faculty Mentors</h2>
              <p className="text-xs font-black text-primary-500 uppercase tracking-widest mt-1">
                Real-time availability tracking
              </p>
            </div>
          </div>
          <div className="relative w-full md:w-96 group">
            <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Search name or expertise..."
              className="w-full pl-14 pr-6 py-4 bg-neutral-50 border border-transparent focus:bg-white focus:border-primary-100 focus:ring-4 focus:ring-primary-50 rounded-2xl text-sm font-bold outline-none transition-all text-neutral-700"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Grid List */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? filtered.map(s => {
              const existingReq = getExistingRequest(s._id);
              const status = existingReq?.requestStatus;

              const stats = {
                 active: s.currentProjectsCount || 0,
                 max: s.maxProjects || 5
              };

              const isFull = stats.active >= stats.max; 
              const isProjectSupervised = !!project?.supervisor;

              return (
                <motion.div
                  key={s._id}
                  layout
                  variants={itemVariants}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`p-8 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                    status === 'Sent' ? 'border-warning-200 bg-warning-50/50 shadow-sm' :
                    status === 'Accepted' ? 'border-success-200 bg-success-50/50 shadow-sm' :
                    isFull ? 'border-neutral-100 bg-neutral-50 opacity-90' : 
                    'bg-white border-neutral-100 shadow-sm hover:shadow-xl hover:border-primary-100 hover:-translate-y-1 group'
                  }`}
                >
                  <div>
                    {/* Status Badge */}
                    {(status || isFull) && (
                      <div className={`absolute top-6 right-6 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm z-10 ${
                        status === 'Sent' ? 'bg-warning-500 text-white animate-pulse' :
                        status === 'Accepted' ? 'bg-success-500 text-white' :
                        isFull ? 'bg-neutral-800 text-white' : 'bg-success-500 text-white'
                      }`}>
                        {isFull && !status ? <FaLock size={10}/> : status === 'Sent' ? <FaPaperPlane /> : <FaCheckCircle />}
                        {isFull && !status ? 'Locked' : status}
                      </div>
                    )}

                    {/* Profile Header */}
                    <div className="flex items-center gap-5 mb-6 pr-12">
                      <div className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner border transition-transform group-hover:scale-105 overflow-hidden ${
                        status === 'Sent' ? 'bg-white text-warning-500 border-warning-100' : 'bg-primary-50 text-primary-600 border-primary-100'
                      }`}>
                        {s.profilePicture ? <img src={s.profilePicture} className="w-full h-full object-cover" alt="" /> : s.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-neutral-900 text-lg leading-tight truncate">{s.name}</h4>
                        <p className="text-xs font-black text-primary-500 uppercase tracking-widest truncate mt-1">{s.department}</p>
                      </div>
                    </div>

                    {/* Capacity Workbench */}
                    <div className={`p-5 rounded-2xl mb-8 border transition-colors ${isFull ? 'bg-white border-neutral-200' : 'bg-neutral-50 border-neutral-100 group-hover:bg-white'}`}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                          <FaInfoCircle /> Mentorship Load
                        </span>
                        <span className={`text-xs font-black ${isFull ? 'text-error-500' : 'text-neutral-900'}`}>
                          {stats.active} / {stats.max}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((stats.active / stats.max) * 100, 100)}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full ${isFull ? 'bg-error-500' : 'bg-primary-500'}`}
                        />
                      </div>
                      {isFull && (
                        <p className="text-xs text-error-500 font-bold mt-3 flex items-center gap-1.5 uppercase tracking-widest bg-error-50 p-1.5 rounded-lg justify-center">
                          <FaExclamationTriangle /> Maximum capacity reached
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    disabled={isFull || requestingId === s._id || status === 'Sent' || isProjectSupervised || status === 'Accepted'}
                    onClick={() => handleInviteInitiated(s._id, s.name)}
                    className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 ${
                      status === 'Sent'
                        ? 'bg-warning-500 text-white shadow-lg shadow-warning-200 cursor-default active:scale-100'
                        : status === 'Accepted'
                        ? 'bg-success-500 text-white shadow-lg shadow-success-200 cursor-default active:scale-100'
                        : isFull || isProjectSupervised
                        ? 'bg-neutral-100 text-neutral-300 cursor-not-allowed shadow-none active:scale-100'
                        : 'bg-neutral-900 text-white hover:bg-primary-600 shadow-xl hover:shadow-primary-600/30'
                    }`}
                  >
                    {requestingId === s._id ? 'Sending Request...' :
                     status === 'Sent' ? <><FaPaperPlane /> Invitation Pending</> :
                     status === 'Accepted' ? <><FaCheckCircle /> Confirmed Mentor</> :
                     isProjectSupervised ? <><FaLock /> Mentor Assigned</> :
                     isFull ? <><FaLock /> Closed for Requests</> : 
                     <><FaPaperPlane /> Transmit Request</>}
                  </button>
                </motion.div>
              );
            }) : (
              /* EMPTY STATE */
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-24 bg-white rounded-3xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center text-center"
              >
                 <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
                     <FaSearch className="text-3xl text-neutral-300" />
                 </div>
                 <h4 className="text-lg font-black text-neutral-900 mb-1">No Faculty Found</h4>
                 <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Adjust your search parameters</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ✅ Action Confirmation Modal */}
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

export default SupervisorSelectionTab;