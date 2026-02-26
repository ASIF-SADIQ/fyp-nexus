import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { 
  FaFilePdf, FaArrowLeft, FaProjectDiagram, FaUserTie, 
  FaUsers, FaInfoCircle, FaUserPlus, FaCheckDouble, FaExternalLinkAlt 
} from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';
import api from "../../services/api";
import ActionConfirmModal from '../shared/ActionConfirmModal';

const ProjectReviewTab = ({ projects, users, searchTerm, refresh }) => {
  const [selections, setSelections] = useState({});
  const [selectedProject, setSelectedProject] = useState(null);

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    type: 'primary',
    onConfirm: () => {}
  });

  const filteredProjects = projects.filter(p => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = 
      p.title.toLowerCase().includes(search) || 
      (p.leader?.name || p.student?.name || "").toLowerCase().includes(search) ||
      p.status.toLowerCase() === search;

    if (search === "approved") return p.status === "Approved" && matchesSearch;
    if (search === "completed") return p.status === "Completed" && matchesSearch;
    return p.status === "Pending" && matchesSearch;
  });

  const handleProcessApproval = (projectId, mode) => {
    const supervisorId = selections[projectId];
    
    if (mode === 'ASSIGN' && !supervisorId) {
      setConfirmConfig({
        isOpen: true,
        title: "Incomplete Directive",
        message: "A faculty member must be selected from the registry before manual assignment can be finalized.",
        confirmText: "Acknowledge",
        type: "danger",
        onConfirm: () => {}
      });
      return;
    }

    const isAssign = mode === 'ASSIGN';

    setConfirmConfig({
      isOpen: true,
      title: isAssign ? "Finalize Assignment" : "Authorize Proposal",
      message: isAssign 
        ? "This will bypass student selection and immediately link this project to the selected supervisor. Proceed?" 
        : "Authorize this proposal and place it in the public pool for supervisor selection?",
      confirmText: isAssign ? "Approve & Link" : "Authorize Only",
      type: isAssign ? "primary" : "success",
      onConfirm: async () => {
        try {
          await api.put(`/projects/${projectId}/status`, { 
            status: "Approved", 
            supervisorId: isAssign ? supervisorId : null 
          });
          toast.success("Project registry updated successfully.");
          refresh();
        } catch (error) {
          setConfirmConfig({
            isOpen: true,
            title: "Registry Conflict",
            message: error.response?.data?.message || "Internal server error during project authorization.",
            confirmText: "Close",
            type: "danger",
            onConfirm: () => {}
          });
        }
      }
    });
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {selectedProject ? (
          /* --- ENHANCED DEEP DIVE VIEW --- */
          <motion.div 
            key="detail"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setSelectedProject(null)}
                className="group flex items-center gap-3 text-slate-400 hover:text-blue-600 transition-all font-black text-[10px] uppercase tracking-[0.2em]"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-50">
                  <FaArrowLeft />
                </div>
                Return to Registry
              </button>

              <div className="flex gap-3">
                {selectedProject.proposalDocument && (
                  <a 
                    href={selectedProject.proposalDocument} 
                    target="_blank" rel="noreferrer"
                    className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
                  >
                    <FaFilePdf className="text-rose-500" /> Export PDF
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Content Area */}
              <div className="lg:col-span-8 space-y-8">
                <div className="bg-white p-12 rounded-[3.5rem] border border-slate-50 shadow-sm relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-10">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm ${
                          selectedProject.status === 'Approved' ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'
                        }`}>
                          {selectedProject.status} Phase
                        </span>
                        <span className="text-[10px] font-black text-slate-300 tracking-widest uppercase">
                          ID: {selectedProject._id.slice(-8).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <FaProjectDiagram className="text-slate-50 text-7xl group-hover:text-blue-50 transition-colors" />
                  </div>

                  <h2 className="text-4xl font-black text-slate-900 leading-[1.1] tracking-tighter mb-6">
                    {selectedProject.title}
                  </h2>
                  
                  <div className="prose prose-slate max-w-none">
                    <p className="text-slate-500 text-lg leading-relaxed font-medium">
                      {selectedProject.description || "Administrative Note: No abstract provided by the research lead."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mt-12 pt-12 border-t border-slate-50">
                    <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Research Domain</p>
                      <p className="font-black text-slate-700 uppercase text-xs">{selectedProject.domain}</p>
                    </div>
                    <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Registry Entry</p>
                      <p className="font-black text-slate-700 text-xs">{new Date(selectedProject.createdAt).toLocaleDateString([], { dateStyle: 'long'})}</p>
                    </div>
                  </div>
                </div>

                {/* Team Roster */}
                <div className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-sm">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                    <FaUsers className="text-blue-600" /> Personnel Roster
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedProject.members?.map((m) => (
                      <div key={m._id} className="flex items-center gap-5 p-5 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm font-black text-lg border border-slate-50">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-sm leading-none group-hover:text-blue-600 transition-colors">{m.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">{m.rollNo}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar: Status & Control */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl shadow-slate-200 relative overflow-hidden">
                  <div className="relative z-10">
                    <FaUserTie className="text-emerald-400 text-4xl mb-6" />
                    <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-2">Assigned Authority</p>
                    <h3 className="text-2xl font-black mb-1 leading-tight">{selectedProject.supervisor?.name || "Pending Designation"}</h3>
                    <p className="text-xs opacity-50 font-medium mb-10">{selectedProject.supervisor?.email || "Under Review"}</p>
                    
                    {selectedProject.proposalDocument && (
                      <button 
                        onClick={() => window.open(selectedProject.proposalDocument, '_blank')}
                        className="flex items-center justify-center gap-3 w-full py-5 bg-white/10 hover:bg-white/20 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all border border-white/5"
                      >
                        <FaExternalLinkAlt /> Open Project Dossier
                      </button>
                    )}
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                </div>

                <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100">
                  <div className="flex items-center gap-3 mb-4 text-blue-600">
                    <FaInfoCircle />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Coordinator Note</h4>
                  </div>
                  <p className="text-xs text-blue-900/60 font-bold leading-relaxed">
                    Once authorized, the team composition is locked. Any subsequent member migration requires a formal override from the academic board.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* --- ENHANCED TABLE VIEW --- */
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-[3rem] border border-slate-50 overflow-hidden shadow-sm"
          >
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <tr>
                  <th className="px-8 py-6">Project Title & Lead</th>
                  <th className="px-8 py-6 text-center">Dossier</th>
                  {searchTerm.toLowerCase() !== "approved" && <th className="px-8 py-6">Faculty Designation</th>}
                  <th className="px-8 py-6 text-center">Grade / Status</th>
                  <th className="px-8 py-6 text-right">Directives</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredProjects.length > 0 ? filteredProjects.map((p) => (
                  <tr 
                    key={p._id} 
                    onClick={() => setSelectedProject(p)}
                    className="hover:bg-blue-50/30 transition-all cursor-pointer group"
                  >
                    <td className="px-8 py-6">
                      <div className="text-sm font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">{p.title}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">
                          Lead: {p.leader?.name || p.student?.name || "Undefined"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => window.open(p.proposalDocument, '_blank')}
                        className="w-10 h-10 rounded-xl bg-slate-50 text-rose-400 hover:bg-rose-500 hover:text-white transition-all mx-auto flex items-center justify-center shadow-sm"
                      >
                        <FaFilePdf size={14} />
                      </button>
                    </td>

                    {searchTerm.toLowerCase() !== "approved" && (
                      <td className="px-8 py-6" onClick={(e) => e.stopPropagation()}>
                        <select 
                          className="p-3 border border-slate-100 rounded-xl text-[10px] font-black w-full bg-slate-50 outline-none focus:ring-2 focus:ring-blue-100 transition-all uppercase tracking-widest cursor-pointer"
                          onChange={(e) => setSelections({ ...selections, [p._id]: e.target.value })}
                          value={selections[p._id] || ""}
                        >
                          <option value="">Pool Enrollment</option>
                          {users.filter(u => u.role === 'supervisor').map(s => (
                            <option key={s._id} value={s._id}>{s.name.toUpperCase()}</option>
                          ))}
                        </select>
                      </td>
                    )}

                    <td className="px-8 py-6 text-center" onClick={(e) => e.stopPropagation()}>
                      {p.grade?.score ? (
                        <span className="badge-success">{p.grade.score}/100</span>
                      ) : (
                        <span className="badge-info">Pending Eval</span>
                      )}
                    </td>

                    <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                      {p.status === "Pending" ? (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleProcessApproval(p._id, 'APPROVE')} 
                            className="bg-white border-2 border-slate-100 text-slate-400 px-4 py-2.5 rounded-xl text-[9px] font-black hover:border-blue-600 hover:text-blue-600 transition-all uppercase tracking-widest"
                          >
                            Authorize
                          </button>
                          <button 
                            onClick={() => handleProcessApproval(p._id, 'ASSIGN')} 
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[9px] font-black shadow-lg shadow-blue-100 hover:bg-slate-900 transition-all flex items-center gap-2 uppercase tracking-widest"
                          >
                            <FaCheckDouble /> Commit
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                           <span className="w-2 h-2 rounded-full bg-emerald-500" />
                           <span className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.2em]">Validated</span>
                        </div>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="py-32 text-center">
                      <FaProjectDiagram className="mx-auto text-slate-100 text-6xl mb-6" />
                      <p className="text-slate-300 font-black text-xs uppercase tracking-[0.4em]">Registry is currently empty</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>

      <ActionConfirmModal 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        type={confirmConfig.type}
      />
    </>
  );
};

export default ProjectReviewTab;