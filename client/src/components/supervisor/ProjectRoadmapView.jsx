import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  FaTrash, FaRegCalendarCheck, FaUserShield, 
  FaClock, FaExclamationCircle, FaLayerGroup 
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const ProjectRoadmapView = ({ projectId, filterScope }) => {
  const [roadmap, setRoadmap] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/deadlines/project/${projectId}`);
      // Sort by date ascending
      const sorted = data.sort((a, b) => new Date(a.deadlineDate) - new Date(b.deadlineDate));
      setRoadmap(sorted);
    } catch (err) {
      console.error("Roadmap sync failed:", err);
      toast.error("Failed to synchronize roadmap timeline.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchRoadmap();
  }, [projectId]);

  const handleDelete = async (deadlineId) => {
    const deletePromise = api.delete(`/deadlines/${deadlineId}`);

    toast.promise(deletePromise, {
      loading: 'Removing task from roadmap...',
      success: () => {
        setRoadmap(prev => prev.filter(item => item._id !== deadlineId));
        return 'Task permanently removed.';
      },
      error: (err) => err.response?.data?.message || 'Failed to remove task.'
    });
  };

  const displayRoadmap = filterScope 
    ? roadmap.filter(item => item.scope === filterScope)
    : roadmap;

  if (loading) return (
    <div className="py-12 flex flex-col items-center gap-3">
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-400 font-black uppercase text-[9px] tracking-widest">Syncing Timeline...</p>
    </div>
  );

  return (
    <div className="space-y-4 relative">
      {/* Decorative Timeline Thread */}
      {displayRoadmap.length > 0 && (
        <div className="absolute left-[31px] top-6 bottom-6 w-0.5 bg-slate-100 -z-0" />
      )}

      <AnimatePresence mode="popLayout">
        {displayRoadmap.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 border-2 border-dashed border-slate-100 rounded-[2.5rem] text-center bg-white/50"
          >
             <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <FaRegCalendarCheck className="text-slate-200 text-xl" />
             </div>
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">No roadmap tasks scheduled</p>
             <p className="text-slate-300 text-[10px] mt-1 font-medium">Internal group tasks will appear here.</p>
          </motion.div>
        ) : (
          displayRoadmap.map((item, index) => {
            const isExpired = new Date(item.deadlineDate) < new Date();
            const isGlobal = item.scope === 'Global';
            
            return (
              <motion.div 
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={item._id} 
                className="group relative z-10 flex items-center gap-4 p-5 rounded-[2rem] bg-white border border-slate-100 transition-all hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5"
              >
                {/* Scope Icon */}
                <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all ${
                  isGlobal 
                    ? 'bg-slate-900 text-blue-400 border border-slate-800' 
                    : 'bg-blue-50 text-blue-600 border border-blue-100'
                }`}>
                  {isGlobal ? <FaUserShield size={16} /> : <FaLayerGroup size={16} />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h5 className="font-black text-slate-800 text-xs truncate group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h5>
                    {item.isHardDeadline && (
                      <span className="text-[7px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">Strict</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <FaClock className={isExpired ? 'text-slate-300' : 'text-blue-400'} size={10} /> 
                      {new Date(item.deadlineDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <span className="text-[9px] text-slate-200">•</span>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{item.scope}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Delete Action */}
                  {!isGlobal && (
                    <button 
                      onClick={() => handleDelete(item._id)}
                      className="opacity-0 group-hover:opacity-100 w-9 h-9 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100"
                      title="Remove Task"
                    >
                      <FaTrash size={12} />
                    </button>
                  )}

                  <div className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${
                    isExpired 
                      ? 'bg-slate-50 border-slate-100 text-slate-400' 
                      : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                  }`}>
                    {isExpired ? 'Passed' : 'Active'}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectRoadmapView;