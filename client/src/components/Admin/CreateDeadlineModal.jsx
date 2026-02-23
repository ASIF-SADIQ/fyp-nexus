import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { 
  FaCalendarAlt, FaLock, FaUnlock, 
  FaLayerGroup, FaGlobe, FaSpinner, FaPaperPlane 
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const CreateDeadlineModal = ({ isOpen, onClose, refreshData }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadlineDate: '',
    deadlineTime: '23:59',
    scope: 'Batch',
    batch: '2024-FALL', 
    department: 'CS',
    type: 'Document',
    isHardDeadline: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fullDate = new Date(`${formData.deadlineDate}T${formData.deadlineTime}`);
    const payload = { ...formData, deadlineDate: fullDate };

    if (formData.scope === 'Global') {
      delete payload.batch;
      delete payload.department;
    }

    const broadcastPromise = api.post('/deadlines', payload);

    toast.promise(broadcastPromise, {
      loading: 'Broadcasting milestone to registry...',
      success: () => {
        refreshData();
        onClose();
        setFormData({ ...formData, title: '', description: '', deadlineDate: '' });
        return 'Milestone published successfully.';
      },
      error: (err) => err.response?.data?.message || 'Failed to publish milestone.'
    });

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" 
        />
        
        {/* Modal Body */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20"
        >
          {/* Header */}
          <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-black tracking-tight">Broadcast Milestone</h2>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mt-2">FYP Nexus Administrative Tool</p>
            </div>
            <FaCalendarAlt className="absolute -bottom-6 -right-6 text-white/5 text-[10rem] pointer-events-none" />
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            
            {/* Scope Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Target Audience</label>
              <div className="grid grid-cols-2 gap-3 p-2 bg-slate-100 rounded-3xl">
                {[
                  { id: 'Global', icon: <FaGlobe />, label: 'All Users' },
                  { id: 'Batch', icon: <FaLayerGroup />, label: 'Targeted' }
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, scope: s.id })}
                    className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                      formData.scope === s.id 
                        ? "bg-white text-blue-600 shadow-xl shadow-blue-500/10 scale-[1.02]" 
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Deliverable Title</label>
              <input
                type="text"
                required
                className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-slate-800 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                placeholder="e.g. Final Thesis Submission"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            {/* Targeted Fields (Animated) */}
            <AnimatePresence>
              {formData.scope === 'Batch' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden grid grid-cols-2 gap-4"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Batch ID</label>
                    <input 
                      type="text"
                      className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-slate-800 outline-none border-2 border-transparent focus:border-blue-500"
                      value={formData.batch}
                      onChange={(e) => setFormData({...formData, batch: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Dept</label>
                    <input 
                      type="text"
                      className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-slate-800 outline-none border-2 border-transparent focus:border-blue-500"
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Schedule Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Due Date</label>
                <input
                  type="date"
                  required
                  className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none border-2 border-transparent focus:border-blue-500"
                  value={formData.deadlineDate}
                  onChange={(e) => setFormData({...formData, deadlineDate: e.target.value})}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Cutoff Time</label>
                <input
                  type="time"
                  required
                  className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none border-2 border-transparent focus:border-blue-500"
                  value={formData.deadlineTime}
                  onChange={(e) => setFormData({...formData, deadlineTime: e.target.value})}
                />
              </div>
            </div>

            {/* Restriction Toggle */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Enforcement Level</label>
              <div 
                onClick={() => setFormData({...formData, isHardDeadline: !formData.isHardDeadline})}
                className={`group w-full p-6 rounded-[2rem] flex items-center justify-between cursor-pointer transition-all border-2 ${
                  formData.isHardDeadline 
                    ? 'bg-rose-50 border-rose-100 text-rose-600 shadow-xl shadow-rose-500/5' 
                    : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.isHardDeadline ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
                    {formData.isHardDeadline ? <FaLock /> : <FaUnlock />}
                  </div>
                  <div>
                    <p className="font-black text-[10px] uppercase tracking-widest">
                      {formData.isHardDeadline ? "Hard Lockdown" : "Soft Deadline"}
                    </p>
                    <p className="text-[9px] font-medium opacity-60">
                      {formData.isHardDeadline ? "Submissions disabled after time" : "Late submissions allowed"}
                    </p>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.isHardDeadline ? 'bg-rose-200' : 'bg-emerald-200'}`}>
                   <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isHardDeadline ? 'left-7' : 'left-1'}`} />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-slate-50">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] py-5 rounded-2xl font-black bg-slate-900 text-white shadow-2xl shadow-slate-900/20 hover:bg-blue-600 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-3"
              >
                {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                Publish Milestone
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateDeadlineModal;