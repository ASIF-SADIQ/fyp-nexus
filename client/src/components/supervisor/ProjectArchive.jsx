import React, { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";
import { 
  FaArrowLeft, FaArchive, FaGraduationCap, FaFilePdf, FaSearch, 
  FaCalendarAlt, FaExternalLinkAlt, FaTimesCircle 
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";

const ProjectArchive = () => {
  const navigate = useNavigate();
  const [archivedProjects, setArchivedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchArchive = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/projects/my");
        // Filter for end-of-life project states
        const filtered = data.filter(p => p.status === 'Completed' || p.status === 'Rejected');
        setArchivedProjects(filtered);
      } catch (err) {
        toast.error("Failed to sync with academic records.");
        console.error("Archive fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArchive();
  }, []);

  const filtered = archivedProjects.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-12 font-sans selection:bg-blue-100">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation & Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <motion.button 
            whileHover={{ x: -4 }}
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-blue-600 transition-colors"
          >
            <FaArrowLeft /> Return to Console
          </motion.button>
          
          <div className="relative w-full md:w-80 group">
            <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by title or domain..." 
              className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-[2rem] shadow-sm group-focus-within:shadow-xl group-focus-within:shadow-blue-500/5 outline-none text-xs font-bold text-slate-700 transition-all placeholder:text-slate-300"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Hero Section */}
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-900/20">
              <FaArchive size={20} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Academic Archive
            </h1>
          </div>
          <p className="text-slate-500 font-medium text-sm ml-1">
            Official repository of concluded supervisions and historical project outcomes.
          </p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 w-full bg-white rounded-[2rem] border border-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filtered.length > 0 ? filtered.map((p) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={p._id} 
                  className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between group hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all"
                >
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className={`shrink-0 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-2xl shadow-inner transition-colors ${
                      p.status === 'Completed' 
                        ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white' 
                        : 'bg-rose-50 text-rose-600 group-hover:bg-rose-500 group-hover:text-white'
                    }`}>
                      {p.status === 'Completed' ? <FaGraduationCap /> : <FaTimesCircle />}
                    </div>
                    
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                          p.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {p.status}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                          <FaCalendarAlt size={10} /> 
                          {new Date(p.updatedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="font-black text-slate-800 text-lg leading-tight truncate max-w-md group-hover:text-blue-600 transition-colors">
                        {p.title}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mt-1">
                        {p.domain}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 mt-6 md:mt-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-50 pt-4 md:pt-0">
                    <div className="text-left md:text-right">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Team Leader</p>
                      <p className="text-sm font-black text-slate-700">{p.leader?.name || "Unassigned"}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <motion.a 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={p.proposalDocument} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-2 px-5 py-3 bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all border border-transparent hover:border-rose-100"
                      >
                        <FaFilePdf size={14} /> Proposal
                      </motion.a>
                      
                      <button className="p-3 bg-slate-50 text-slate-300 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100">
                        <FaExternalLinkAlt size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-32 bg-white rounded-[4rem] border-4 border-dashed border-slate-50"
                >
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaArchive className="text-slate-200" size={30} />
                  </div>
                  <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">No Archived Records Found</p>
                  <p className="text-slate-300 text-sm mt-2">Historical data will appear here once projects are closed.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectArchive;