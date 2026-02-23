import React, { useState, useEffect, useMemo } from "react";
import { FaTimes, FaEnvelope, FaBrain, FaListOl, FaLock, FaUniversity, FaCalendarAlt, FaIdCard } from "react-icons/fa";
import api from "../services/api"; 

const AddUserModal = ({ isOpen, onClose, refreshData, roleType }) => {
  const adminDept = useMemo(() => {
    const raw = localStorage.getItem("userInfo");
    const parsed = raw ? JSON.parse(raw) : null;
    return (parsed?.user?.department || parsed?.department || "Software Engineering");
  }, []);

  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    rollNo: "", 
    department: adminDept, 
    batch: "2026", 
    password: "Nexus@123", 
    expertise: [], 
    maxProjects: 3  
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Clean reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        email: "",
        rollNo: "",
        department: adminDept,
        batch: "2026",
        password: "Nexus@123",
        expertise: [],
        maxProjects: 3
      });
    }
  }, [isOpen, adminDept]);

  const departmentOptions = [
    "Software Engineering", "Electrical Engineering", "Mechanical Engineering", 
    "Computer Science", "Data Science", "Artificial Intelligence"
  ];

  const expertiseOptions = ["MERN Stack", "AI/ML", "IoT", "Cybersecurity", "Blockchain", "Cloud Computing"];

  if (!isOpen) return null;

  const handleExpertiseToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.includes(skill)
        ? prev.expertise.filter(s => s !== skill)
        : [...prev.expertise, skill]
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault(); // ✅ Prevent default form behavior
    setIsSubmitting(true);
    try {
      const finalRole = roleType === "supervisor" ? "supervisor" : "student";
      
      // ✅ EXPERT TIP: Construct a clean payload based on role
      const payload = {
        name: formData.name,
        email: formData.email.toLowerCase().trim(),
        rollNo: formData.rollNo,
        department: formData.department,
        password: formData.password,
        role: finalRole
      };

      if (finalRole === "student") {
        payload.batch = formData.batch;
      } else {
        payload.expertise = formData.expertise;
        payload.maxProjects = parseInt(formData.maxProjects);
      }

      // ✅ Matches your adminRoutes.js: router.post('/add-user'...)
      await api.post("/admin/add-user", payload); 
      
      alert(`${finalRole.toUpperCase()} registered successfully!`);
      await refreshData(); 
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed. Email or ID likely exists.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl relative border border-gray-100 max-h-[90vh] flex flex-col">
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-400 hover:text-red-500 transition-all hover:rotate-90">
          <FaTimes size={20} />
        </button>
        
        <div className="mb-6">
            <h3 className="text-2xl font-black text-gray-800 tracking-tight">
                Register {roleType === "supervisor" ? "Faculty" : "Student"}
            </h3>
            <p className="text-blue-600 text-[10px] font-black uppercase tracking-widest mt-1 italic">
              Coordinator for {adminDept}
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto pr-2 custom-scrollbar flex-1">
          <div className="space-y-4">
            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                <input type="text" placeholder="e.g. Ali Ahmed" className="w-full p-4 border-none rounded-2xl bg-gray-50 font-bold text-gray-700 outline-none focus:ring-4 ring-blue-500/10" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <FaIdCard className="text-blue-500" /> {roleType === "supervisor" ? "Faculty ID" : "Roll Number"}
                </label>
                <input type="text" placeholder={roleType === "supervisor" ? "EMP-1020" : "2026-CS-01"} className="w-full p-4 border-none rounded-2xl bg-gray-50 font-bold text-gray-700 outline-none focus:ring-4 ring-blue-500/10" 
                  value={formData.rollNo} onChange={e => setFormData({...formData, rollNo: e.target.value})} required />
            </div>
            
            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Official Email</label>
                <input type="email" placeholder="name@university.edu" className="w-full p-4 border-none rounded-2xl bg-gray-50 font-bold text-gray-700 outline-none focus:ring-4 ring-blue-500/10" 
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Department</label>
              <select className="w-full p-4 border-none rounded-2xl bg-gray-50 font-bold text-gray-700 outline-none focus:ring-4 ring-blue-500/10"
                value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} >
                {departmentOptions.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            </div>

            {roleType === "student" && (
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        <FaCalendarAlt className="text-blue-500" /> Graduation Year
                    </label>
                    <input type="text" placeholder="2026" className="w-full p-4 border-none rounded-2xl bg-gray-50 font-bold text-gray-700 outline-none focus:ring-4 ring-blue-500/10" 
                        value={formData.batch} onChange={e => setFormData({...formData, batch: e.target.value})} required />
                </div>
            )}
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1">
                <FaLock /> Security Key
              </label>
              <input type="text" className="w-full p-4 border border-blue-100 rounded-2xl bg-blue-50/30 font-bold text-blue-700 outline-none" 
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
            </div>
          </div>

          {roleType === "supervisor" && (
            <div className="space-y-4 pt-6 border-t border-gray-100">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <FaBrain className="text-purple-500" /> Research Expertise
              </label>
              <div className="flex flex-wrap gap-2">
                {expertiseOptions.map(skill => (
                  <button key={skill} type="button" onClick={() => handleExpertiseToggle(skill)}
                    className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${
                      formData.expertise.includes(skill) ? "bg-purple-600 text-white shadow-lg shadow-purple-100" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    }`}>
                    {skill}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                    <FaListOl className="text-gray-400" />
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Supervision Limit:</label>
                </div>
                <input type="number" className="w-12 p-1 bg-white border border-gray-200 rounded-lg text-center font-black text-blue-600 outline-none"
                  value={formData.maxProjects} onChange={e => setFormData({...formData, maxProjects: parseInt(e.target.value)})} />
              </div>
            </div>
          )}

          {/* ✅ Submit Button inside the form */}
          <button 
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 mt-4 ${
              isSubmitting ? "bg-gray-400 text-white cursor-not-allowed" : "bg-gray-900 text-white hover:bg-blue-600 shadow-gray-200"
            }`}
          >
            {isSubmitting ? "Syncing..." : "Confirm & Register User"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;