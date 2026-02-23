import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { 
  FaFilePdf, 
  FaCloudUploadAlt, 
  FaCheckCircle, 
  FaClock, 
  FaExternalLinkAlt,
  FaRegFolderOpen,
  FaProjectDiagram,
  FaCalendarDay
} from 'react-icons/fa';
import { motion } from "framer-motion";
import api from '../../services/api';
import ActionConfirmModal from '../shared/ActionConfirmModal'; // ✅ Implemented Custom Modal

const DocumentTab = ({ project, deadlines = [], onRefresh }) => {
  const [uploadingId, setUploadingId] = useState(null);

  // ✅ State for custom confirmation modal
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    type: 'primary',
    onConfirm: () => {}
  });

  // Helper: Formats Date into "Weekday, MMM DD, YYYY at HH:MM AM/PM"
  const formatFullTimestamp = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const getSubmission = (deadlineId) => {
    if (!project?.submissions || !deadlineId) return null;
    return project.submissions.find(
      (s) => s.deadlineId?.toString() === deadlineId.toString()
    );
  };

  const initialDocs = useMemo(() => {
    const docs = [];
    if (project?.proposalDocument) {
      docs.push({
        title: "Initial Project Proposal",
        fileUrl: project.proposalDocument,
        submittedAt: project.createdAt, 
        type: "Genesis",
      });
    }
    return docs;
  }, [project]);

  // ✅ Triggered when a file is selected
  const handleUploadInitiated = (e, deadlineId, title) => {
    const file = e.target.files[0];
    if (!file || !project?._id) return;

    // Reset the input value so selecting the same file again triggers onChange
    e.target.value = null;

    setConfirmConfig({
      isOpen: true,
      title: "Confirm Submission",
      message: `Are you sure you want to upload "${file.name}" as your final submission for "${title}"?`,
      confirmText: "Submit Document",
      type: "primary",
      onConfirm: () => executeUpload(file, deadlineId)
    });
  };

  // ✅ Actual upload logic executed after modal confirmation
  const executeUpload = async (file, deadlineId) => {
    setUploadingId(deadlineId);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('deadlineId', deadlineId);

    try {
      await api.post(`/projects/${project._id}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Document synchronized to archive."); // ✅ Toast instead of alert
      if (onRefresh) onRefresh(); 
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload sequence failed."); // ✅ Toast instead of alert
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
        
        {/* --- HEADER --- */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-black tracking-tight uppercase">Document Repository</h3>
            <p className="text-blue-200 text-xs font-bold mt-1 uppercase tracking-[0.2em]">
              Digital Archive & Submission Log
            </p>
          </div>
          <FaRegFolderOpen size={140} className="absolute -right-6 -bottom-6 text-white/5 rotate-12" />
        </div>

        {/* --- SECTION 1: GENESIS FILES (Initial Proposal) --- */}
        {initialDocs.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-4">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <FaProjectDiagram size={14} />
              </div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Genesis Documents</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {initialDocs.map((doc, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-blue-200 transition-all">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 text-2xl group-hover:scale-110 transition-transform">
                        <FaFilePdf />
                      </div>
                      <div className="text-right">
                          <span className="text-[9px] font-black uppercase px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                              Archived
                          </span>
                      </div>
                    </div>
                    <h5 className="font-black text-slate-800 text-lg leading-tight mb-2">{doc.title}</h5>
                    
                    <div className="flex items-center gap-2 text-slate-400 mb-6">
                      <FaCalendarDay size={12} className="text-blue-400" />
                      <p className="text-[10px] font-bold uppercase tracking-tight">
                          Submitted: <span className="text-slate-600">{formatFullTimestamp(doc.submittedAt)}</span>
                      </p>
                    </div>
                  </div>

                  <a 
                    href={doc.fileUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest text-center hover:bg-blue-600 transition-all shadow-lg"
                  >
                    <FaExternalLinkAlt className="inline mr-2" size={10} /> View Archive
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- SECTION 2: ROADMAP DELIVERABLES --- */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-4">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                <FaClock size={14} />
            </div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Roadmap Submissions</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deadlines.map((deadline) => {
              const submission = getSubmission(deadline._id);
              const isUploading = uploadingId === deadline._id;

              return (
                <div key={deadline._id} className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all">
                  <div>
                      <div className="flex justify-between items-start mb-6">
                          <div className={`p-4 rounded-2xl text-2xl ${submission ? 'bg-blue-50 text-blue-500' : 'bg-slate-50 text-slate-300'}`}>
                              {submission ? <FaCheckCircle /> : <FaCloudUploadAlt />}
                          </div>
                          <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${submission ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                              {submission ? 'Complete' : 'Pending'}
                          </span>
                      </div>
                      
                      <h5 className="font-black text-slate-800 mb-1">{deadline.title}</h5>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-4">
                          Deadline: {new Date(deadline.deadlineDate).toDateString()}
                      </p>

                      {submission && (
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                              <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Receipt Stamp</p>
                              <p className="text-[10px] font-bold text-slate-600">
                                  {formatFullTimestamp(submission.submittedAt)}
                              </p>
                          </div>
                      )}
                  </div>
                  
                  <div className="mt-4">
                      {submission ? (
                          <a href={submission.fileUrl} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">
                             <FaExternalLinkAlt className="mr-2" size={10} /> View Submission
                          </a>
                      ) : (
                          <label className={`w-full flex items-center justify-center py-4 rounded-xl font-black text-[10px] uppercase tracking-widest cursor-pointer transition-all ${isUploading ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100'}`}>
                              <input 
                                type="file" 
                                className="hidden" 
                                onChange={(e) => handleUploadInitiated(e, deadline._id, deadline.title)} 
                                disabled={isUploading} 
                                accept=".pdf,.doc,.docx,.zip"
                              />
                              {isUploading ? "Uploading..." : "Submit Deliverable"}
                          </label>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </motion.div>

      {/* ✅ The Custom Modal Component Rendered Here */}
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