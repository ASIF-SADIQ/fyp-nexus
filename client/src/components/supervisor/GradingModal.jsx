import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify'; 
import { 
  FaTimes, FaStar, FaExternalLinkAlt, FaFileAlt, FaSpinner, FaCheckCircle 
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { submitProjectGrade } from '../../services/api';
import ActionConfirmModal from '../shared/ActionConfirmModal'; 

const GradingModal = ({ isOpen, onClose, projectId, onGradeSuccess }) => {
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setScore('');
      setFeedback('');
    }
  }, [isOpen]);

  // Determine color based on score
  const getScoreColor = () => {
    const num = Number(score);
    if (num >= 80) return 'text-emerald-500';
    if (num >= 50) return 'text-blue-500';
    if (num > 0) return 'text-rose-500';
    return 'text-slate-300';
  };

  const handleValidation = () => {
    if (!score || isNaN(score) || score < 0 || score > 100) {
      toast.error("Please enter a valid score between 0 and 100.");
      return;
    }
    if (!feedback || feedback.trim() === '') {
      toast.error("Please provide feedback for the project.");
      return;
    }
    setIsConfirmOpen(true);
  };

  const executeGrade = async () => {
    try {
      setLoading(true);
      await submitProjectGrade(projectId, {
        score: Number(score),
        feedback: feedback.trim()
      });
      
      toast.success("Project graded successfully!");
      onGradeSuccess(); 
      setIsConfirmOpen(false);
      onClose(); // Close the main grading modal too
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to grade project.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* MAIN GRADING MODAL */}
      <AnimatePresence>
        {isOpen && !isConfirmOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
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
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/20 transition-all text-white/50 hover:text-white relative z-10">
                  <FaTimes size={18} />
                </button>
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
              </div>

              <div className="p-8 space-y-6">
                
                {/* Project Info */}
                <div className="flex items-center justify-between p-5 bg-neutral-50 rounded-2xl border border-neutral-100">
                   <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-neutral-400 border border-neutral-100 shadow-sm">
                        <FaStar />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">Project Evaluation</p>
                        <p className="text-xs font-bold text-neutral-900">Final Project Grade</p>
                      </div>
                   </div>
                </div>

                {/* Grading Inputs */}
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                     <div className="flex justify-between items-center px-1">
                       <label className="text-xs font-black text-neutral-400 uppercase tracking-widest">Technical Score (0-100)</label>
                       {score && <span className={`text-xs font-black ${getScoreColor()}`}>{score}%</span>}
                     </div>
                     <input 
                       type="number" 
                       value={score} 
                       onChange={(e) => setScore(e.target.value)}
                       className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 font-bold"
                       placeholder="00"
                       min="0"
                       max="100"
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Evaluator Feedback</label>
                     <textarea 
                       value={feedback} 
                       onChange={(e) => setFeedback(e.target.value)}
                       className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 h-32 resize-none font-medium"
                       placeholder="Provide constructive feedback on technical implementation, documentation, or areas for improvement..."
                     />
                  </div>
                </div>

                {/* Submission Button */}
                <button 
                  onClick={handleValidation}
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-3 disabled:bg-slate-300"
                >
                  {loading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle className="text-emerald-200" />}
                  {loading ? "Processing..." : "Submit Evaluation"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION MODAL */}
      {/* It sits completely outside the AnimatePresence block so it layers on top perfectly */}
      <ActionConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeGrade}
        title="Confirm Project Evaluation"
        message={`Are you sure you want to finalize this project grade? The students will receive a score of ${score}/100 and your technical feedback immediately.`}
        confirmText="Finalize Grade"
        type="success"
      />
    </>
  );
};

export default GradingModal;