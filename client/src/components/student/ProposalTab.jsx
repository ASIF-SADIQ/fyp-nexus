import React, { useState } from "react";
import toast from 'react-hot-toast'; // ✅ Now actively used
import { 
  FaPlus, FaCloudUploadAlt, FaFilePdf, 
  FaIdCard, FaProjectDiagram, FaTrash 
} from "react-icons/fa";
import { motion } from "framer-motion";
import api from "../../services/api";

const ProposalTab = ({ fetchData }) => {
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
      toast.error("Please upload a valid PDF document."); // ✅ Replaced alert()
      e.target.value = null; // Clear the bad input
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please upload your proposal PDF."); // ✅ Replaced alert()
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
        toast.success("Proposal submitted successfully!"); // ✅ Replaced alert()
        
        // 1. Reset the local form state
        setFormData({
            title: "",
            technologies: "",
            description: "",
            domain: "Web Development",
            teammateRollNumbers: ""
        });
        setFile(null);

        // 2. Refresh parent data & auto-switch to Overview tab
        if (fetchData) {
            await fetchData(); 
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Submission failed. Please try again."); // ✅ Replaced alert()
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 mx-auto"
    >
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-lg text-sm">
                <FaPlus />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Project Initiation</h3>
        </div>
        <p className="text-gray-400 font-medium text-sm ml-1">Submit your proposal details for department approval.</p>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Section: Details */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Project Title</label>
            <input 
              name="title"
              type="text" 
              placeholder="e.g. AI-Based Surveillance System"
              required 
              className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-bold text-gray-700 focus:ring-2 focus:ring-blue-100 transition-all"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Domain</label>
              <select 
                name="domain"
                className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-bold text-gray-700 cursor-pointer"
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
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tech Stack</label>
              <input 
                name="technologies"
                type="text" 
                placeholder="MERN, Python"
                required 
                className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-bold text-gray-700 focus:ring-2 focus:ring-blue-100 transition-all"
                value={formData.technologies}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1 flex items-center gap-2">
              <FaIdCard /> Teammates (Roll Numbers)
            </label>
            <input 
              name="teammateRollNumbers"
              type="text" 
              placeholder="e.g. 2026-CS-12, 2026-CS-15"
              className="w-full p-4 bg-blue-50/30 border border-blue-100 rounded-2xl outline-none font-bold text-blue-700 placeholder:text-blue-300 focus:ring-2 focus:ring-blue-200 transition-all"
              value={formData.teammateRollNumbers}
              onChange={handleChange}
            />
            <p className="text-[9px] text-gray-400 italic ml-1">* Separate roll numbers with commas</p>
          </div>
        </div>

        {/* Right Section: Description & File */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Brief Description</label>
            <textarea 
              name="description"
              placeholder="Outline the core problem and your proposed solution..." 
              required 
              className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-bold h-32 resize-none text-gray-700 focus:ring-2 focus:ring-blue-100 transition-all"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="border-4 border-dashed border-gray-50 rounded-[2rem] p-8 text-center relative hover:border-blue-100 transition-all group bg-white shadow-inner">
            <input 
              type="file" 
              accept="application/pdf" 
              required={!file}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              onChange={handleFileChange}
            />
            {file ? (
              <div className="flex flex-col items-center relative z-20">
                <FaFilePdf className="text-5xl text-red-500 mb-2" />
                <p className="text-xs font-bold text-slate-700 truncate max-w-[200px]">{file.name}</p>
                <button 
                    type="button" 
                    onClick={() => setFile(null)} 
                    className="mt-3 px-4 py-1 bg-red-50 text-[10px] text-red-500 font-black uppercase tracking-widest rounded-lg hover:bg-red-500 hover:text-white transition-all relative z-20"
                >
                    Remove File
                </button>
              </div>
            ) : (
              <div className="py-4">
                <FaCloudUploadAlt className="mx-auto text-5xl text-gray-200 group-hover:text-blue-500 transition-colors mb-2" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">Click or Drag Proposal PDF</p>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full py-5 text-white font-black rounded-2xl transition shadow-xl uppercase tracking-widest text-xs mt-2 ${
              isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed shadow-none' 
              : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100 hover:shadow-blue-200 active:scale-95'
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