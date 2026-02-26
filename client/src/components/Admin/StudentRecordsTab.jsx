import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { 
  FaEdit, FaTrash, FaArrowLeft, FaUserGraduate, 
  FaIdCard, FaProjectDiagram, FaEnvelope, FaUsers, 
  FaSearch, FaFilter, FaExternalLinkAlt 
} from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';
import api from "../../services/api";

const StudentRecordsTab = ({ projects, users, searchTerm, refresh, onEdit }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Memoized filter to handle high-volume user lists without UI lag
  const filteredStudents = useMemo(() => {
    return users.filter(u => {
      const isStudent = u.role === 'student';
      const search = searchTerm.toLowerCase();
      return isStudent && (
        u.name?.toLowerCase().includes(search) || 
        u.rollNo?.toLowerCase().includes(search) || 
        u.email?.toLowerCase().includes(search)
      );
    });
  }, [users, searchTerm]);

  const handleDelete = async (id) => {
    // Note: In a production environment, wrap this in your ActionConfirmModal
    if (window.confirm("CRITICAL: Deleting this student will remove all project associations. Proceed?")) {
      try {
        await api.delete(`/users/${id}`);
        toast.success("Student registry updated (Record Deleted)");
        refresh();
        setSelectedStudent(null);
      } catch (error) {
        toast.error("Protocol failure: Unable to delete record.");
      }
    }
  };

  return (
    <div className="min-h-[600px]">
      <AnimatePresence mode="wait">
        {selectedStudent ? (
          /* --- STUDENT DOSSIER VIEW (DEEP DIVE) --- */
          <motion.div 
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setSelectedStudent(null)}
                className="group flex items-center gap-3 text-slate-400 hover:text-blue-600 transition-all font-black text-[10px] uppercase tracking-[0.2em]"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-50">
                  <FaArrowLeft />
                </div>
                Registry List
              </button>

              <button 
                onClick={() => onEdit(selectedStudent)}
                className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-900 transition-all shadow-xl shadow-blue-100"
              >
                <FaEdit /> Modify Profile
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Profile Card */}
              <div className="lg:col-span-4">
                <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-blue-500 rounded-[2rem] flex items-center justify-center text-4xl mb-6 shadow-inner">
                      <FaUserGraduate />
                    </div>
                    <h2 className="text-3xl font-black tracking-tighter mb-1">{selectedStudent.name}</h2>
                    <p className="text-blue-400 text-xs font-black uppercase tracking-[0.3em] mb-8">
                      {selectedStudent.rollNo || 'UNASSIGNED ID'}
                    </p>
                    
                    <div className="space-y-6 pt-6 border-t border-white/10">
                      <div className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-blue-400 transition-colors">
                          <FaEnvelope />
                        </div>
                        <div>
                          <p className="text-[8px] font-black uppercase opacity-40">Network Email</p>
                          <p className="text-sm font-bold truncate max-w-[180px]">{selectedStudent.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-blue-400 transition-colors">
                          <FaIdCard />
                        </div>
                        <div>
                          <p className="text-[8px] font-black uppercase opacity-40">Academic Batch</p>
                          <p className="text-sm font-bold">{selectedStudent.batch || 'Class of 2026'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Decorative element */}
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl -mb-16 -mr-16" />
                </div>
              </div>

              {/* Status & History */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white rounded-[3rem] border border-slate-50 p-10 shadow-sm h-full">
                  <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                    <FaProjectDiagram className="text-blue-600" /> Current Academic FYP Deployment
                  </h3>
                  
                  {(() => {
                    const studentProject = projects.find(p => p.members?.some(m => m._id === selectedStudent._id));
                    return studentProject ? (
                      <div className="space-y-8">
                        <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative group overflow-hidden">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Project Title</p>
                          <h4 className="text-2xl font-black text-slate-800 leading-tight pr-10 group-hover:text-blue-600 transition-colors">
                            {studentProject.title}
                          </h4>
                          <div className="absolute top-8 right-8 text-slate-200 group-hover:text-blue-100 transition-colors">
                            <FaExternalLinkAlt size={20} />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                          <div className="p-6 bg-white border-2 border-slate-50 rounded-3xl">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Phase Status</p>
                            <span className={`inline-block px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                              studentProject.status === 'Approved' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-orange-500 text-white shadow-lg shadow-orange-100'
                            }`}>
                              {studentProject.status}
                            </span>
                          </div>
                          <div className="p-6 bg-white border-2 border-slate-50 rounded-3xl">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Domain</p>
                            <p className="font-black text-slate-700 text-xs uppercase tracking-tighter">{studentProject.domain}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-200 mb-4 shadow-sm">
                          <FaProjectDiagram size={24} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">No Active Deployment</p>
                        <p className="text-[11px] text-slate-400 mt-1">This student has not been linked to a project registry.</p>
                      </div>
                    );
                  })()}

                  <div className="mt-12 flex justify-end pt-8 border-t border-slate-50">
                    <button 
                      onClick={() => handleDelete(selectedStudent._id)}
                      className="text-rose-500 font-black text-[10px] uppercase tracking-widest hover:text-rose-700 transition-colors flex items-center gap-2"
                    >
                      <FaTrash /> Purge Student Record
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* --- STUDENT REGISTRY TABLE VIEW --- */
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden"
          >
            <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                  <FaUsers size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Student Registry</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">Found {filteredStudents.length} Active Profiles</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="p-3 bg-white border border-slate-100 rounded-xl text-slate-300">
                  <FaFilter size={12} />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-50">
                  <tr>
                    <th className="px-8 py-6">Identity & Network</th>
                    <th className="px-8 py-6">Academic Vector</th>
                    <th className="px-8 py-6">FYP Status</th>
                    <th className="px-8 py-6">Grade / Status</th>
                    <th className="px-8 py-6 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredStudents.map((s) => {
                    const project = projects.find(p => p.members?.some(m => m._id === s._id));
                    return (
                      <tr 
                        key={s._id} 
                        onClick={() => setSelectedStudent(s)}
                        className="hover:bg-blue-50/40 transition-all cursor-pointer group"
                      >
                        <td className="px-8 py-6">
                          <div className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors">{s.name}</div>
                          <div className="text-[10px] text-slate-400 font-medium lowercase tracking-tight mt-1">{s.email}</div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-xs font-bold text-slate-600 uppercase tracking-tighter">{s.department}</div>
                          <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Roll: {s.rollNo || 'N/A'}</div>
                        </td>
                        <td className="px-8 py-6">
                          {project ? (
                            <div className="flex flex-col">
                              <span className="text-slate-800 font-black text-[10px] truncate max-w-[150px]">"{project.title}"</span>
                              <span className="text-[8px] text-emerald-500 uppercase font-black tracking-widest mt-1 flex items-center gap-1">
                                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> {project.status}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-300 uppercase text-[8px] font-black tracking-widest border border-slate-100 px-2 py-1 rounded-lg">No Submission</span>
                          )}
                        </td>
                        <td className="px-8 py-6">
                          {project?.grade?.score ? (
                            <span className="badge-success">{project.grade.score}/100</span>
                          ) : (
                            <span className="badge-info">Pending Eval</span>
                          )}
                        </td>
                        <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                              onClick={() => onEdit(s)}
                              className="w-9 h-9 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all flex items-center justify-center shadow-sm"
                            >
                              <FaEdit size={12} />
                            </button>
                            <button 
                              onClick={() => handleDelete(s._id)}
                              className="w-9 h-9 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all flex items-center justify-center shadow-sm"
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {filteredStudents.length === 0 && (
                <div className="py-32 text-center">
                  <FaSearch className="mx-auto text-slate-100 text-6xl mb-6" />
                  <p className="text-slate-300 font-black text-xs uppercase tracking-[0.4em]">No matching records found</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentRecordsTab;