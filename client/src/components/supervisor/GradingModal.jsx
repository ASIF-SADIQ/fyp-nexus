import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast'; // ✅ Standardized notifications
import { 
  FaTimes, FaStar, FaExternalLinkAlt, FaFileAlt, FaSpinner, FaCheckCircle 
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import ActionConfirmModal from '../shared/ActionConfirmModal'; // ✅ Added for safety

const GradingModal = ({ isOpen, onClose, project, submission, onUpdate }) => {
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Load existing grade if available
  useEffect(() => {
    if (submission) {
      setMarks(submission.marks || '');
      setFeedback(submission.feedback || '');
    }
  }, [submission]);

  // Determine color based on score
  const getScoreColor = () => {
    const num = Number(marks);
    if (num >= 80) return 'text-emerald-500';
    if (num >= 50) return 'text-blue-500';
    if (num > 0) return 'text-rose-500';
    return 'text-slate-300';
  };

  const handleValidation = () => {
    if (!marks || isNaN(marks) || marks < 0 || marks > 100) {
      toast.error("Please enter a valid score between 0 and 100.");
      return;
    }
    setIsConfirmOpen(true);
  };

  const executeGrade = async () => {
    try {
      setLoading(true);
      await api.put(`/projects/${project._id}/grade`, {
        submissionId: submission._id,
        marks,
        feedback
      });
      
      toast.success("Grade and feedback synchronized.");
      onUpdate(); 
      setIsConfirmOpen(false);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Grading synchronization failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !submission) return null;

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} 
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" 
          />
          
          {/* Modal */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 30 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden z-10"
          >
            {/* Header */}
            <div className="bg-slate-900 p-8 flex justify-between items-center text-white relative">
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-emerald-500/20">
                  <FaStar />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Project Evaluation</p>
                  <h3 className="text-xl font-black tracking-tight">Grade Deliverable</h3>
                </div>
              </div>
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/20 transition-all text-white/50 hover:text-white">
                <FaTimes size={18} />
              </button>
              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
            </div>

            <div className="p-8 space-y-6">
              
              {/* Asset Reference */}
              <div className="flex items-center justify-between p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
                 <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                      <FaFileAlt />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Submitted Asset</p>
                      <p className="text-xs font-bold text-slate-800 truncate">{submission.title}</p>
                    </div>
                 </div>
                 <a 
                   href={submission.fileUrl} 
                   target="_blank" 
                   rel="noreferrer"
                   className="shrink-0 flex items-center gap-2 text-[10px] font-black bg-white text-slate-600 border border-slate-200 px-4 py-2.5 rounded-xl hover:border-blue-500 hover:text-blue-600 hover:shadow-lg hover:shadow-blue-500/10 transition-all active:scale-95"
                 >
                   Review <FaExternalLinkAlt />
                 </a>
              </div>

              {/* Grading Inputs */}
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                   <div className="flex justify-between items-center px-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Technical Score (0-100)</label>
                     {marks && <span className={`text-xs font-black ${getScoreColor()}`}>{marks}%</span>}
                   </div>
                   <input 
                     type="number" 
                     value={marks} 
                     onChange={(e) => setMarks(e.target.value)}
                     className="w-full p-5 bg-white border-2 border-slate-100 rounded-2xl font-black text-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none transition-all placeholder:text-slate-200"
                     placeholder="00"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Evaluator Feedback</label>
                   <textarea 
                     value={feedback} 
                     onChange={(e) => setFeedback(e.target.value)}
                     className="w-full h-32 p-5 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-emerald-100 focus:ring-4 focus:ring-emerald-50 outline-none resize-none transition-all placeholder:text-slate-300"
                     placeholder="Provide constructive feedback on technical implementation, documentation, or areas for improvement..."
                   />
                </div>
              </div>

              {/* Submission Button */}
              <button 
                onClick={handleValidation}
                disabled={loading}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
              >
                {loading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle className="text-emerald-400" />}
                {loading ? "Processing..." : "Submit Evaluation"}
              </button>

            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Safety Confirmation */}
      <ActionConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeGrade}
        title="Confirm Evaluation"
        message={`Are you sure you want to finalize this grade? The students will receive a score of ${marks}/100 and your technical feedback immediately.`}
        confirmText="Finalize Grade"
        type="success"
      />
    </>
  );
};

export default GradingModal;