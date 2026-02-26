import React, { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { 
  FaFilePdf, 
  FaCloudUploadAlt, 
  FaCheckCircle, 
  FaClock, 
  FaExternalLinkAlt,
  FaRegFolderOpen,
  FaProjectDiagram,
  FaCalendarDay,
  FaFileArchive,
  FaSpinner,
  FaFolderPlus,
  FaFileSignature,
  FaHistory,
  FaTimes // ✅ BUG FIX: Added the missing close icon back here!
} from 'react-icons/fa';
import { motion, AnimatePresence } from "framer-motion";
import api from '../../services/api';
import ActionConfirmModal from '../shared/ActionConfirmModal';

const DocumentTab = ({ project, deadlines = [], onRefresh }) => {
  const [uploadingId, setUploadingId] = useState(null);
  
  // Custom Generic Upload State
  const [isGeneralUploadOpen, setIsGeneralUploadOpen] = useState(false);
  const [generalFile, setGeneralFile] = useState(null);
  const [generalFileTitle, setGeneralFileTitle] = useState('');
  const [isUploadingGeneral, setIsUploadingGeneral] = useState(false);

  // Modal State
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    type: 'primary',
    onConfirm: () => {}
  });

  // Date Formatter
  const formatFullTimestamp = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
    }).format(date);
  };

  // Safe Extract Deliverables vs General Resources
  const getSubmission = (deadlineId) => {
    if (!project?.submissions || !Array.isArray(project.submissions) || !deadlineId) return null;
    return project.submissions.find(
      (s) => s.deadlineId && s.deadlineId.toString() === deadlineId.toString()
    );
  };

  const initialDocs = useMemo(() => {
    const docs = [];
    if (project?.proposalDocument) {
      docs.push({ 
        title: "Initial Project Proposal", 
        fileUrl: project.proposalDocument, 
        submittedAt: project.createdAt, 
        type: "Genesis" 
      });
    }
    return docs;
  }, [project]);

  const generalResources = useMemo(() => {
    if (!project?.submissions || !Array.isArray(project.submissions)) return [];
    // Only return submissions that DO NOT have a deadlineId (meaning they are random uploads)
    return project.submissions.filter(s => !s.deadlineId || s.status === 'Resource');
  }, [project]);

  // ==========================================
  // HANDLERS: Official Deadlines
  // ==========================================
  const handleUploadInitiated = (e, deadlineId, title) => {
    const file = e.target.files[0];
    if (!file || !project?._id) return;
    
    // Set to empty string instead of null to prevent React event crashes
    e.target.value = ''; 

    setConfirmConfig({
      isOpen: true,
      title: "Confirm Submission",
      message: `Are you about to upload "${file.name}" as your final submission for "${title}". Proceed?`,
      confirmText: "Submit Document",
      type: "primary",
      onConfirm: () => executeUpload(file, deadlineId, title)
    });
  };

  const executeUpload = async (file, deadlineId, title) => {
    setUploadingId(deadlineId);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('deadlineId', deadlineId);
    if(title) formData.append('title', title);

    try {
      await api.post(`/projects/${project._id}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Document synchronized to archive."); 
      if (onRefresh) onRefresh(); 
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload sequence failed."); 
    } finally {
      setUploadingId(null);
    }
  };

  // ==========================================
  // HANDLERS: General Random Resources
  // ==========================================
  const handleGeneralUpload = async (e) => {
    e.preventDefault();
    if (!generalFile) return toast.error("Please select a file.");
    if (!generalFileTitle.trim()) return toast.error("Please provide a title for this resource.");

    setIsUploadingGeneral(true);
    const formData = new FormData();
    formData.append('file', generalFile);
    formData.append('title', generalFileTitle);

    try {
      await api.post(`/projects/${project._id}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Resource uploaded successfully!"); 
      setIsGeneralUploadOpen(false);
      setGeneralFile(null);
      setGeneralFileTitle("");
      if (onRefresh) onRefresh(); 
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload resource."); 
    } finally {
      setIsUploadingGeneral(false);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 pb-20">
        
        {/* --- HERO HEADER --- */}
        <div className="bg-slate-900 p-10 md:p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8 border border-slate-800">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center backdrop-blur-md border border-blue-500/30">
                 <FaRegFolderOpen size={18} />
               </div>
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Vault Operations</span>
            </div>
            <h3 className="text-3xl md:text-5xl font-black tracking-tight mb-2">Document Repository</h3>
            <p className="text-slate-400 text-sm font-medium max-w-lg">
              Manage official academic deliverables, project proposals, and share general workflow resources with your mentor.
            </p>
          </div>
          
          <button 
            onClick={() => setIsGeneralUploadOpen(true)}
            className="relative z-10 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)] flex items-center gap-3 hover:-translate-y-1 active:translate-y-0"
          >
            <FaFolderPlus size={16} /> Upload General File
          </button>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <FaRegFolderOpen size={240} className="absolute -right-12 -bottom-12 text-white/[0.02] rotate-12 pointer-events-none" />
        </div>

        {/* --- SECTION 1: GENESIS FILES (Initial Proposal) --- */}
        {initialDocs.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <FaFileSignature size={12} />
              </div>
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Genesis Documents</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {initialDocs.map((doc, i) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-100 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 opacity-50 transition-transform group-hover:scale-110 pointer-events-none" />
                  
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl shadow-inner shrink-0 relative z-10">
                    <FaFilePdf />
                  </div>
                  <div className="min-w-0 flex-1 relative z-10">
                    <h5 className="font-black text-slate-900 text-sm truncate mb-1">{doc.title}</h5>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatFullTimestamp(doc.submittedAt)}</p>
                  </div>
                  <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm shrink-0 relative z-10">
                    <FaExternalLinkAlt size={14} />
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- SECTION 2: GENERAL RESOURCES (Random Uploads) --- */}
        {generalResources.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                <FaHistory size={12} />
              </div>
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">General Resources</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generalResources.map((doc, i) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-xl hover:shadow-purple-500/5 hover:border-purple-200 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 opacity-50 transition-transform group-hover:scale-110 pointer-events-none" />

                  <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl shadow-inner shrink-0 relative z-10">
                    <FaFileArchive />
                  </div>
                  <div className="min-w-0 flex-1 relative z-10">
                    <h5 className="font-black text-slate-900 text-sm truncate mb-1">{doc.title}</h5>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatFullTimestamp(doc.submittedAt)}</p>
                  </div>
                  <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all shadow-sm shrink-0 relative z-10">
                    <FaExternalLinkAlt size={14} />
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- SECTION 3: ROADMAP DELIVERABLES --- */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-2 mt-4 pt-8 border-t border-slate-200/50">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <FaProjectDiagram size={12} />
            </div>
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Official Deliverables</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deadlines.map((deadline) => {
              const submission = getSubmission(deadline._id);
              const isUploading = uploadingId === deadline._id;

              return (
                <div key={deadline._id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-xl hover:shadow-emerald-500/5 transition-all relative overflow-hidden group">
                  {submission && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />}
                  
                  <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner transition-transform group-hover:scale-105 ${submission ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-300'}`}>
                              {submission ? <FaCheckCircle /> : <FaCloudUploadAlt />}
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${submission ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                              {submission ? 'Complete' : 'Pending'}
                          </span>
                      </div>
                      
                      <h5 className="font-black text-slate-900 text-lg mb-2 line-clamp-1">{deadline.title}</h5>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                          <FaCalendarDay className="text-slate-300" /> Due: {new Date(deadline.deadlineDate).toDateString()}
                      </p>
                  </div>
                    
                  <div className="relative z-10 mt-auto pt-6 border-t border-slate-50">
                      {submission ? (
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-slate-50 rounded-2xl p-3 border border-slate-100">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Submitted On</p>
                              <p className="text-[10px] font-bold text-slate-700 truncate">{new Date(submission.submittedAt).toLocaleDateString()}</p>
                            </div>
                            <a href={submission.fileUrl} target="_blank" rel="noreferrer" className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-500 transition-all shadow-md shrink-0 active:scale-95">
                                <FaExternalLinkAlt size={14} />
                            </a>
                          </div>
                      ) : (
                          <label className={`w-full flex items-center justify-center py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest cursor-pointer transition-all active:scale-[0.98] ${isUploading ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-blue-600 shadow-xl hover:shadow-blue-500/20'}`}>
                              <input 
                                type="file" className="hidden" 
                                onChange={(e) => handleUploadInitiated(e, deadline._id, deadline.title)} 
                                disabled={isUploading} 
                                accept=".pdf,.doc,.docx,.zip"
                              />
                              {isUploading ? <><FaSpinner className="animate-spin mr-2"/> Uploading...</> : "Submit Deliverable"}
                          </label>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </motion.div>

      {/* ✅ BEAUTIFUL GENERAL RESOURCE UPLOAD MODAL */}
      <AnimatePresence>
        {isGeneralUploadOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isUploadingGeneral && setIsGeneralUploadOpen(false)} 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden z-10 border border-slate-100"
            >
              {/* Modal Header */}
              <div className="bg-slate-900 p-8 flex justify-between items-center text-white relative">
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-blue-500/20">
                    <FaFolderPlus />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Vault Access</p>
                    <h3 className="text-xl font-black tracking-tight">Upload Resource</h3>
                  </div>
                </div>
                <button onClick={() => setIsGeneralUploadOpen(false)} disabled={isUploadingGeneral} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-slate-300 hover:bg-rose-500 hover:text-white transition-all shadow-sm disabled:opacity-50 relative z-10">
                  <FaTimes />
                </button>
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
              </div>

              {/* Modal Body */}
              <form onSubmit={handleGeneralUpload} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Document Title</label>
                  <input 
                    type="text" 
                    value={generalFileTitle}
                    onChange={(e) => setGeneralFileTitle(e.target.value)}
                    placeholder="e.g. Database Schema Diagram"
                    required
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-4 font-bold outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select File</span>
                  {/* Changed div to label. Clicking anywhere inside opens the PC folder! */}
                  <label className="block w-full border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all bg-slate-50 cursor-pointer relative group">
                    <input 
                      type="file" 
                      onChange={(e) => setGeneralFile(e.target.files[0])}
                      className="hidden" // Hides the ugly native input button
                    />
                    {generalFile ? (
                       <div className="text-blue-600 font-black text-sm flex flex-col items-center">
                         <FaCheckCircle className="text-5xl mb-3 text-emerald-500 shadow-sm rounded-full" />
                         <span className="truncate max-w-[250px]">{generalFile.name}</span>
                       </div>
                    ) : (
                       <div className="text-slate-400 flex flex-col items-center group-hover:text-blue-500 transition-colors">
                         <FaCloudUploadAlt className="text-6xl mb-3" />
                         <span className="text-[11px] font-black uppercase tracking-widest">Click to browse or drag file here</span>
                       </div>
                    )}
                  </label>
                </div>

                <button 
                  type="submit"
                  disabled={isUploadingGeneral || !generalFile || !generalFileTitle}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 disabled:bg-slate-300 disabled:cursor-not-allowed text-xs uppercase tracking-widest shadow-xl hover:shadow-blue-500/30 hover:-translate-y-1 active:translate-y-0 mt-4"
                >
                  {isUploadingGeneral ? <><FaSpinner className="animate-spin text-lg" /> Uploading to Vault...</> : "Add to Repository"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EXISTING CONFIRMATION MODAL */}
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

export default DocumentTab;