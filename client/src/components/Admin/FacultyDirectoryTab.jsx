import React, { useState, useMemo } from 'react';
import { 
  FaEdit, FaArrowLeft, FaChalkboardTeacher, FaEnvelope, 
  FaBriefcase, FaProjectDiagram, FaUsers, FaGraduationCap, FaChevronRight 
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const FacultyDirectoryTab = ({ projects, users, searchTerm, onEdit }) => {
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  // Link faculty to their active projects and calculate workload
  const facultyList = useMemo(() => {
    return users
      .filter(u => u.role === 'supervisor' && u.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(t => {
        const supervising = projects.filter(p => p.supervisor?._id === t._id);
        const maxCapacity = t.maxProjects || 5;
        return { 
          ...t, 
          projectCount: supervising.length, 
          activeProjects: supervising,
          isOverloaded: supervising.length >= maxCapacity,
          capacityPercent: (supervising.length / maxCapacity) * 100
        };
      });
  }, [users, projects, searchTerm]);

  // --- 1. PROFILE DEEP DIVE VIEW ---
  if (selectedFaculty) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
        className="space-y-8"
      >
        {/* Navigation Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50">
          <button 
            onClick={() => setSelectedFaculty(null)}
            className="group flex items-center gap-3 text-slate-400 hover:text-blue-600 transition-all font-black text-[10px] uppercase tracking-widest"
          >
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                <FaArrowLeft />
            </div>
            Back to Registry
          </button>

          <button 
            onClick={() => onEdit(selectedFaculty)}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all active:scale-95 shadow-xl shadow-slate-200"
          >
            <FaEdit size={12} /> Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Identity Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[3rem] p-10 border border-slate-50 shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center text-4xl text-white mb-6 shadow-2xl shadow-blue-200">
                  <FaChalkboardTeacher />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{selectedFaculty.name}</h2>
                <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-8">{selectedFaculty.department} Department</p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                    <FaEnvelope className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-600">{selectedFaculty.email}</span>
                  </div>
                  
                  <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
                    <p className="text-[9px] uppercase font-black opacity-50 tracking-widest mb-4">Core Expertise</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedFaculty.expertise?.map((exp, i) => (
                        <span key={i} className="bg-white/10 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-white/5">{exp}</span>
                      )) || <span className="text-[10px] opacity-40 italic">No tags defined</span>}
                    </div>
                  </div>
                </div>
              </div>
              <FaGraduationCap className="absolute -bottom-10 -right-10 text-slate-50 text-[15rem] pointer-events-none" />
            </div>
          </div>

          {/* Supervision Dashboard */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-[3rem] p-10 border border-slate-50 shadow-sm">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                  <FaBriefcase className="text-blue-600" /> 
                  Supervision Log 
                  <span className="ml-2 px-3 py-1 bg-slate-100 rounded-full text-[10px] text-slate-400">{selectedFaculty.projectCount} Projects</span>
                </h3>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {selectedFaculty.activeProjects.length > 0 ? selectedFaculty.activeProjects.map((proj) => (
                  <div key={proj._id} className="group p-6 rounded-[2rem] border border-slate-50 bg-slate-50/30 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-start mb-6">
                      <div className="max-w-[70%]">
                        <h4 className="text-lg font-black text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">{proj.title}</h4>
                        <div className="flex items-center gap-2 mt-2">
                           <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{proj.domain}</span>
                           <span className="w-1 h-1 rounded-full bg-slate-300" />
                           <span className="text-[9px] text-blue-500 font-bold">Group ID: {proj._id.slice(-6).toUpperCase()}</span>
                        </div>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        proj.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {proj.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-3">
                        {proj.members?.map((m, i) => (
                          <div key={m._id} className="w-8 h-8 rounded-full bg-white border-2 border-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm" title={m.name}>
                            {m.name[0]}
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] font-bold text-slate-400">
                        {proj.members?.length} Personnel Assigned
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                    <FaProjectDiagram className="mx-auto text-slate-100 text-5xl mb-4" />
                    <p className="text-slate-300 font-black text-xs uppercase tracking-widest">Available for Supervision</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // --- 2. MAIN DIRECTORY TABLE ---
  return (
    <div className="bg-white rounded-[3rem] border border-slate-50 overflow-hidden shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <tr>
            <th className="px-8 py-6">Faculty Identity</th>
            <th className="px-8 py-6">Department</th>
            <th className="px-8 py-6">Workload Intensity</th>
            <th className="px-8 py-6 text-right">Registry</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {facultyList.map((f) => (
            <tr 
              key={f._id} 
              onClick={() => setSelectedFaculty(f)}
              className="hover:bg-blue-50/30 transition-all cursor-pointer group"
            >
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <FaChalkboardTeacher />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">{f.name}</div>
                    <div className="text-[10px] text-slate-400 font-medium lowercase tracking-tight">{f.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest">{f.department}</td>
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-32 bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${f.capacityPercent}%` }}
                      className={`h-full rounded-full ${f.isOverloaded ? 'bg-rose-500' : 'bg-blue-600'}`}
                    ></motion.div>
                  </div>
                  <span className={`text-[11px] font-black ${f.isOverloaded ? 'text-rose-500' : 'text-slate-400'}`}>
                    {f.projectCount} <span className="opacity-30">/</span> {f.maxProjects || 5}
                  </span>
                </div>
              </td>
              <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={() => onEdit(f)} 
                  className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 hover:bg-blue-600 hover:text-white transition-all active:scale-90 flex items-center justify-center ml-auto"
                >
                  <FaEdit size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {facultyList.length === 0 && (
        <div className="p-20 text-center text-slate-200 font-black uppercase tracking-[0.3em] text-xs">No personnel match search criteria</div>
      )}
    </div>
  );
};

export default FacultyDirectoryTab;