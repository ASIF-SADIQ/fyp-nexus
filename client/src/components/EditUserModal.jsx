import React, { useState, useEffect } from "react";
import { FaTimes, FaSave, FaUniversity, FaCalendarAlt, FaBrain, FaListOl, FaIdCard } from "react-icons/fa";
import api from "../services/api";

const EditUserModal = ({ isOpen, onClose, refreshData, user }) => {
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    batch: "",
    rollNo: "",
    maxProjects: 3,
    expertise: "" 
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        department: user.department || "Software Engineering",
        batch: user.batch || "",
        rollNo: user.rollNo || "",
        maxProjects: user.maxProjects || 3,
        expertise: Array.isArray(user.expertise) ? user.expertise.join(", ") : ""
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // ✅ EXPERT TIP: Construct a clean object to avoid sending empty strings that crash the DB
      const submissionData = {};
      
      if (formData.name) submissionData.name = formData.name;
      if (formData.department) submissionData.department = formData.department;
      
      if (user.role === 'student') {
        if (formData.rollNo) submissionData.rollNo = formData.rollNo;
        if (formData.batch) submissionData.batch = formData.batch;
      }

      if (user.role === 'supervisor') {
        if (formData.rollNo) submissionData.rollNo = formData.rollNo;
        // Handle expertise array conversion
        submissionData.expertise = formData.expertise 
          ? formData.expertise.split(",").map(item => item.trim()).filter(item => item !== "")
          : [];
        // Ensure maxProjects is a valid number to prevent 500 errors
        submissionData.maxProjects = parseInt(formData.maxProjects) || 3;
      }

      // ✅ Use the route we just fixed in adminRoutes.js
      await api.put(`/admin/${user._id}`, submissionData); 
      
      alert(`Success: ${user.role.toUpperCase()} profile updated.`);
      await refreshData();
      onClose();
    } catch (err) {
      // ✅ Improved error reporting from our new errorHandler middleware
      const errorMsg = err.response?.data?.message || "Database synchronization failed.";
      alert(`Error: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in zoom-in duration-300">
      <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl relative border border-gray-100">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
            <div>
                <h3 className="text-2xl font-black text-gray-800 tracking-tight">Modify Profile</h3>
                <p className="text-blue-600 text-[10px] font-black uppercase tracking-widest mt-1">
                  Nexus ID: {user.email}
                </p>
            </div>
            <button onClick={onClose} className="bg-gray-50 p-2.5 rounded-xl text-gray-400 hover:text-red-500 transition-all">
                <FaTimes size={18} />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="max-h-[55vh] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            
            {/* Full Name */}
            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                <input type="text" value={formData.name} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700 focus:ring-4 ring-blue-500/10" onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>

            {/* ID / Roll No */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <FaIdCard className="text-blue-500"/> {user.role === 'supervisor' ? "Faculty ID" : "Roll Number"}
              </label>
              <input type="text" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700 focus:ring-4 ring-blue-500/10" value={formData.rollNo} onChange={e => setFormData({...formData, rollNo: e.target.value})} required />
            </div>
            
            {/* Department */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><FaUniversity className="text-blue-500"/> Department</label>
              <select className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700 focus:ring-4 ring-blue-500/10" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                <option>Software Engineering</option>
                <option>Computer Science</option>
                <option>Data Science</option>
                <option>Artificial Intelligence</option>
              </select>
            </div>

            {/* Student Fields */}
            {user.role === 'student' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><FaCalendarAlt className="text-blue-500"/> Batch</label>
                <input type="text" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700 focus:ring-4 ring-blue-500/10" value={formData.batch} onChange={e => setFormData({...formData, batch: e.target.value})} />
              </div>
            )}

            {/* Supervisor Fields */}
            {user.role === 'supervisor' && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><FaBrain className="text-purple-500"/> Expertise</label>
                  <input type="text" placeholder="e.g. MERN, AI (comma separated)" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700 focus:ring-4 ring-blue-500/10" value={formData.expertise} onChange={e => setFormData({...formData, expertise: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><FaListOl className="text-purple-500"/> Max Groups</label>
                  <input type="number" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700 focus:ring-4 ring-blue-500/10" value={formData.maxProjects} onChange={e => setFormData({...formData, maxProjects: e.target.value})} />
                </div>
              </>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all mt-4 flex items-center justify-center gap-2 ${
              isSubmitting ? "bg-gray-400 text-white cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-100"
            }`}
          >
            {isSubmitting ? "Processing..." : <><FaSave /> Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;