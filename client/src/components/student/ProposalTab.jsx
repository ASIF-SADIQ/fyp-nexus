import React, { useState } from 'react';
import { toast } from 'react-toastify'; 
import { 
  FaPlus, FaCloudUploadAlt, FaFilePdf, 
  FaIdCard, FaProjectDiagram, FaCheckCircle,
  FaArrowRight
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import api from '../../services/api';

// ✅ Added `project` and `setActiveTab` to the props
const ProposalTab = ({ fetchData, project, setActiveTab }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    technologies: "",
    description: "",
    domain: "Web Development",
    teammateRollNumbers: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      toast.error("Please upload a valid PDF document."); 
      e.target.value = null; 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please upload your proposal PDF."); 
      return;
    }
    
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("technologies", formData.technologies);
      data.append("description", formData.description);
      data.append("domain", formData.domain);
      data.append("teammateRollNumbers", formData.teammateRollNumbers);
      data.append("proposalDocument", file);

      const response = await api.post("/projects", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.status === 201 || response.status === 200) {
        toast.success("Proposal submitted successfully!"); 
        
        setFormData({
            title: "",
            technologies: "",
            description: "",
            domain: "Web Development",
            teammateRollNumbers: ""
        });
        setFile(null);

        if (fetchData) {
            await fetchData(); 
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Submission failed. Please try again."); 
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ NEW LOGIC: If the student already has a project, show the Active Project Card instead of the form.
  if (project) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto mt-12 bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 text-center relative overflow-hidden"
      >
        {/* Decorative Background Blur */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner relative z-10">
          <FaCheckCircle />
        </div>
        
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight relative z-10">
          Proposal Already Approved
        </h2>
        
        <p className="text-slate-600 font-medium leading-relaxed mb-8 max-w-md mx-auto relative z-10">
          You are already assigned to the project <strong className="text-slate-900">"{project.title}"</strong>. You cannot submit multiple proposals.
        </p>

        <button 
          onClick={() => {
            if(setActiveTab) setActiveTab('overview');
          }}
          className="bg-slate-900 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1 flex items-center gap-3 mx-auto relative z-10"
        >
          Go to Project Dashboard <FaArrowRight />
        </button>
      </motion.div>
    );
  }

  // ✅ EXISTING LOGIC: If they don't have a project, show the submission form.
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 mx-auto"
    >
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-50 text-blue-600 p-2 rounded-lg text-sm">
                <FaPlus />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Project Initiation</h3>
        </div>
        <p className="text-slate-500 font-medium text-sm ml-1">Submit your proposal details for department approval.</p>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Section: Details */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Project Title</label>
            <input 
              name="title"
              type="text" 
              placeholder="e.g. AI-Based Surveillance System"
              required 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Domain</label>
              <select 
                name="domain"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 cursor-pointer focus:ring-2 focus:ring-blue-500 transition-all"
                value={formData.domain}
                onChange={handleChange}
              >
                <option value="Web Development">Web Development</option>
                <option value="AI / ML">AI / ML</option>
                <option value="Blockchain">Blockchain</option>
                <option value="Cyber Security">Cyber Security</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tech Stack</label>
              <input 
                name="technologies"
                type="text" 
                placeholder="MERN, Python, TensorFlow"
                required 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
                value={formData.technologies}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Brief Description</label>
            <textarea 
              name="description"
              placeholder="Outline the core problem and your proposed solution..."
              required 
              className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all resize-none p-4"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <FaIdCard /> Teammates (Roll Nos)
              </label>
              <input 
                name="teammateRollNumbers"
                type="text" 
                placeholder="e.g. 2026-CS-12, 2026-CS-15"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
                value={formData.teammateRollNumbers}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 italic mt-8">* Separate roll numbers with commas</p>
            </div>
          </div>
        </div>

        {/* Right Section: Description & File */}
        <div className="space-y-6">
          <div className="border-4 border-dashed border-slate-100 rounded-[2rem] p-8 text-center relative hover:border-blue-400 transition-all group bg-slate-50/50 hover:bg-blue-50/30 h-[280px] flex flex-col items-center justify-center">
            <input 
              type="file" 
              accept="application/pdf" 
              required={!file}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              onChange={handleFileChange}
            />
            {file ? (
              <div className="flex flex-col items-center relative z-20">
                <FaFilePdf className="text-5xl text-rose-500 mb-4" />
                <p className="text-sm font-bold text-slate-700 truncate max-w-[200px] mb-4">{file.name}</p>
                <button 
                    type="button" 
                    onClick={() => setFile(null)} 
                    className="px-6 py-2 bg-white border border-rose-200 text-[10px] text-rose-600 font-black uppercase tracking-widest rounded-xl hover:bg-rose-50 transition-all relative z-20 shadow-sm"
                >
                    Remove File
                </button>
              </div>
            ) : (
              <div>
                <FaCloudUploadAlt className="mx-auto text-6xl text-slate-300 group-hover:text-blue-500 transition-colors mb-4" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">Click or Drag Proposal PDF</p>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full py-5 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl ${
              isSubmitting 
              ? 'bg-slate-400 cursor-not-allowed shadow-none' 
              : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/20 active:scale-95'
            }`}
          >
            {isSubmitting ? 'Uploading to Nexus...' : 'Submit to Department'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ProposalTab;