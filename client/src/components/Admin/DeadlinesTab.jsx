import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { 
  FaClock, FaTrash, FaPlus, FaLock, FaUnlock, 
  FaExclamationTriangle, FaGlobe, FaLayerGroup, 
  FaUserTie, FaSearch, FaHistory 
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import CreateDeadlineModal from './CreateDeadlineModal';

const DeadlinesTab = () => {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDeadlines = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/deadlines'); 
      setDeadlines(data);
    } catch (error) {
      toast.error("Network error: Could not sync milestones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeadlines();
  }, []);

  const handleDelete = async (id) => {
    if(!window.confirm("CRITICAL ACTION: This will remove this milestone for all targeted students. Proceed?")) return;
    
    const deletePromise = api.delete(`/deadlines/${id}`);

    toast.promise(deletePromise, {
      loading: 'Purging milestone...',
      success: () => {
        fetchDeadlines();
        return 'Milestone successfully removed.';
      },
      error: 'Authorization failed or record not found.'
    });
  };

  const getTimeStatus = (dateString) => {
    const now = new Date();
    const due = new Date(dateString);
    const diff = due - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (diff < 0) return { text: "Expired", color: "text-rose-500", bg: "bg-rose-50", icon: <FaHistory /> };
    if (days <= 3) return { text: `${days} Days Left`, color: "text-orange-500", bg: "bg-orange-50", icon: <FaClock className="animate-pulse" /> };
    return { text: `${days} Days Left`, color: "text-blue-500", bg: "bg-blue-50", icon: <FaClock /> };
  };

  if (loading) return (
    <div className="p-20 flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="font-black text-[10px] text-slate-400 uppercase tracking-[0.3em]">Synchronizing Registry...</p>
    </div>
  );

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Milestone Registry</h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Monitoring {deadlines.length} active roadmap directives
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-10 py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-slate-200 hover:bg-blue-600 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          <FaPlus size={12} /> Create New Directive
        </button>
      </div>

      {/* Grid of Deadlines */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <AnimatePresence mode="popLayout">
          {deadlines.map((deadline) => {
            const status = getTimeStatus(deadline.deadlineDate);
            
            return (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={deadline._id} 
                className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:shadow-slate-200/50 transition-all"
              >
                {/* Status Bar */}
                <div className="flex justify-between items-start mb-8">
                  <div className="flex flex-wrap gap-2">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-sm ${
                      deadline.scope === 'Global' ? 'bg-slate-900 text-white' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {deadline.scope === 'Global' ? <FaGlobe /> : <FaLayerGroup />}
                      {deadline.scope} Directive
                    </div>

                    <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm ${status.bg} ${status.color}`}>
                      {status.icon} {status.text}
                    </div>
                  </div>

                  <div className={`text-lg w-12 h-12 flex items-center justify-center rounded-2xl ${deadline.isHardDeadline ? 'bg-rose-50 text-rose-500 shadow-inner' : 'bg-emerald-50 text-emerald-500'}`}>
                    {deadline.isHardDeadline ? <FaLock /> : <FaUnlock />}
                  </div>
                </div>

                <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight group-hover:text-blue-600 transition-colors">
                  {deadline.title}
                </h3>
                <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed line-clamp-2">
                  {deadline.description || "Administrative protocol: Proceed with standard deliverable requirements."}
                </p>

                {/* Target Information */}
                <div className="flex flex-wrap items-center gap-4 mb-8">
                  <div className="bg-slate-50/50 px-5 py-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">System Deadline</p>
                      <p className="text-[11px] font-black text-slate-700">{new Date(deadline.deadlineDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    </div>
                  </div>
                  
                  {deadline.scope !== 'Global' && (
                    <div className="bg-slate-50/50 px-5 py-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Cohort Filter</p>
                        <p className="text-[11px] font-black text-slate-700">
                          {deadline.batch || 'ANY'} • {deadline.department || 'ALL'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Interaction */}
                <div className="flex items-center justify-between mt-auto pt-8 border-t border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-black text-white uppercase shadow-lg">
                      {deadline.createdBy?.name?.[0] || 'A'}
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase">Issuing Authority</p>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">{deadline.createdBy?.name || 'Administrator'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(deadline._id)}
                    className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-300 hover:bg-rose-500 hover:text-white hover:rotate-12 transition-all duration-300 flex items-center justify-center group/btn shadow-sm"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>

                {/* Decorative background element */}
                <div className="absolute -right-4 -top-4 text-slate-50/20 text-8xl pointer-events-none rotate-12 group-hover:text-blue-50/30 transition-colors">
                  {deadline.scope === 'Global' ? <FaGlobe /> : <FaLayerGroup />}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {deadlines.length === 0 && (
          <div className="col-span-full py-40 text-center border-4 border-dashed border-slate-100 rounded-[4rem] bg-white/50 backdrop-blur-sm">
            <div className="w-24 h-24 bg-white shadow-2xl shadow-slate-200 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-8">
              <FaSearch size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">No Active Milestones</h3>
            <p className="text-slate-300 text-sm font-bold mt-2">The system roadmap is currently clear.</p>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="mt-8 text-blue-600 font-black text-xs uppercase tracking-widest hover:underline"
            >
              + Initialize First Milestone
            </button>
          </div>
        )}
      </div>

      <CreateDeadlineModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        refreshData={fetchDeadlines} 
      />
    </div>
  );
};

export default DeadlinesTab;