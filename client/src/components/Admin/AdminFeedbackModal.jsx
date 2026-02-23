import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  FaTimes, FaShieldAlt, FaSpinner, FaPaperPlane, FaGavel, FaInfoCircle
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const AdminFeedbackModal = ({ isOpen, onClose, project, onUpdate }) => {
  const [status, setStatus] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  // Synchronize state with the active project
  useEffect(() => {
    if (project) {
      setStatus(project.status || 'Pending');
      setFeedback(project.adminFeedback || '');
    }
  }, [project]);

  const handleSubmit = async () => {
    if (!feedback.trim() && status === 'Rejected') {
      return toast.error("Please provide a reason for rejection.");
    }

    const updatePromise = api.put(`/projects/${project._id}/status`, {
      status,
      adminFeedback: feedback 
    });

    try {
      setLoading(true);
      await toast.promise(updatePromise, {
        loading: 'Updating project status...',
        success: 'Directive transmitted successfully!',
        error: (err) => err.response?.data?.message || 'Failed to update status.'
      });
      
      onUpdate(); 
      onClose();
    } catch (error) {
      console.error("Adjudication Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !project) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose} 
          className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" 
        />
        
        {/* Modal Content */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 40 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.9, opacity: 0, y: 40 }}
          className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20"
        >
          {/* Header */}
          <div className="bg-slate-900 p-10 flex justify-between items-center text-white relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-5">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-2xl shadow-xl shadow-blue-500/20">
                <FaGavel />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-1">Command Center</p>
                <h3 className="text-2xl font-black tracking-tight">Adjudicate Proposal</h3>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="relative z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              <FaTimes size={18} />
            </button>
            
            {/* Background Decor */}
            <FaShieldAlt className="absolute -bottom-10 -right-10 text-white/[0.03] text-[15rem] pointer-events-none -rotate-12" />
          </div>

          <div className="p-10 space-y-8">
            
            {/* Project Quick Context */}
            <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
              <div className="p-3 bg-white rounded-xl shadow-sm text-slate-400">
                <FaInfoCircle />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Reviewing Node</p>
                <h4 className="text-sm font-black text-slate-800 truncate">{project.title}</h4>
                <p className="text-[10px] text-slate-500 font-medium">Group ID: {project._id.slice(-8).toUpperCase()}</p>
              </div>
            </div>

            {/* Status Selection */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Official Verdict</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'Pending', color: 'amber' },
                  { id: 'Approved', color: 'emerald' },
                  { id: 'Rejected', color: 'rose' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStatus(s.id)}
                    className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 flex flex-col items-center gap-2 ${
                      status === s.id 
                        ? `bg-${s.color}-50 border-${s.color}-500 text-${s.color}-600 shadow-lg shadow-${s.color}-500/10 scale-105`
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${status === s.id ? `bg-${s.color}-500` : 'bg-slate-200'}`} />
                    {s.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Directive Feedback Area */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Administrative Directive</label>
                <span className="text-[10px] font-bold text-slate-300">{feedback.length} characters</span>
              </div>
              <div className="relative group">
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide detailed reasoning for this decision or required modifications..."
                  className="w-full h-40 p-6 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-medium text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none resize-none transition-all placeholder:text-slate-300 shadow-inner"
                />
              </div>
            </div>

            {/* Action Footer */}
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-[2] py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-slate-900/10 active:scale-95"
              >
                {loading ? <FaSpinner className="animate-spin text-lg" /> : <FaPaperPlane className="text-sm" />}
                {loading ? "Transmitting..." : "Execute Decision"}
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AdminFeedbackModal;