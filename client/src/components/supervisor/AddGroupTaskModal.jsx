import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTasks, FaTimes, FaLock, FaUnlock, FaSpinner, FaCalendarAlt, FaClock } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AddGroupTaskModal = ({ isOpen, onClose, project, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadlineDate: '',
    deadlineTime: '23:59',
    isHardDeadline: false 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fullDate = new Date(`${formData.deadlineDate}T${formData.deadlineTime}`);

      // ✅ AUTOMATIC METADATA: Scope is locked to 'Group' for this specific project
      const payload = {
        ...formData,
        deadlineDate: fullDate,
        scope: 'Group',
        targetProject: project._id, 
        type: 'Task'
      };

      await api.post('/deadlines', payload);
      toast.success(`Task successfully assigned to ${project.title}`); // ✅ Replaced alert
      onRefresh();
      onClose();
      // Reset form
      setFormData({ title: '', description: '', deadlineDate: '', deadlineTime: '23:59', isHardDeadline: false });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign task"); // ✅ Replaced alert
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden relative z-10"
          >
            {/* Header */}
            <div className="p-8 bg-blue-600 text-white relative overflow-hidden">
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FaTasks className="text-blue-200" />
                    <h3 className="text-xl font-black uppercase tracking-tight">Assign Task</h3>
                  </div>
                  <p className="text-[10px] font-black opacity-80 uppercase tracking-widest flex items-center gap-1">
                    Target: <span className="text-white underline decoration-blue-400">{project.title}</span>
                  </p>
                </div>
                <button 
                  onClick={onClose} 
                  className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-2xl transition-all"
                >
                  <FaTimes size={18} />
                </button>
              </div>
              {/* Decorative Circle */}
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {/* Task Title */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Milestone / Task</label>
                <input
                  type="text"
                  placeholder="e.g., Draft SRS Document"
                  className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-100 transition-all text-slate-700"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              {/* Deadline Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                    <FaCalendarAlt size={8}/> Date
                  </label>
                  <input
                    type="date"
                    className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-blue-100 transition-all cursor-pointer"
                    value={formData.deadlineDate}
                    onChange={(e) => setFormData({...formData, deadlineDate: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                    <FaClock size={8}/> Time
                  </label>
                  <input
                    type="time"
                    className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-blue-100 transition-all cursor-pointer"
                    value={formData.deadlineTime}
                    onChange={(e) => setFormData({...formData, deadlineTime: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Policy Toggle */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Submission Policy</label>
                <div 
                  onClick={() => setFormData({...formData, isHardDeadline: !formData.isHardDeadline})}
                  className={`group w-full p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all border-2 ${
                    formData.isHardDeadline 
                      ? 'bg-rose-50 border-rose-100 text-rose-600' 
                      : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-blue-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl transition-colors ${formData.isHardDeadline ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-400 group-hover:bg-blue-100'}`}>
                      {formData.isHardDeadline ? <FaLock size={12}/> : <FaUnlock size={12}/>}
                    </div>
                    <span className="font-black text-[10px] uppercase tracking-wider">
                        {formData.isHardDeadline ? "Hard Deadline (Strict)" : "Allow Late Submissions"}
                    </span>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${formData.isHardDeadline ? 'bg-rose-200' : 'bg-slate-200'}`}>
                    <motion.div 
                      animate={{ x: formData.isHardDeadline ? 20 : 2 }}
                      className={`absolute top-1 w-3 h-3 rounded-full transition-colors ${formData.isHardDeadline ? 'bg-rose-600' : 'bg-slate-400'}`}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin text-lg" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Dispatch Task</span>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddGroupTaskModal;