import React, { useState } from 'react';
import toast from 'react-hot-toast'; // ✅ Only imported ONCE here
import { 
  FaGithub, FaLinkedin, FaGlobe, FaCode, 
  FaUserCircle, FaSave, FaPlus, FaTimes, 
  FaCamera, FaEnvelope, FaIdCard, FaUniversity 
} from 'react-icons/fa';
import api from '../../services/api';

const ProfileTab = ({ userInfo, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Initialize state with userInfo props
  const [formData, setFormData] = useState({
    bio: userInfo?.bio || "",
    githubUrl: userInfo?.githubUrl || "",
    linkedinUrl: userInfo?.linkedinUrl || "",
    portfolioUrl: userInfo?.portfolioUrl || "",
    skills: userInfo?.skills || [],
    newSkill: ""
  });

  // --- 1. HANDLE IMAGE UPLOAD ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('avatar', file);

    try {
      setUploading(true);
      await api.post('/users/profile/upload', uploadData);
      toast.success("Avatar Updated!");
      onUpdate(); // Trigger refresh in Parent Dashboard
    } catch (err) {
      toast.error("Upload failed. Check file size.");
    } finally {
      setUploading(false);
    }
  };

  // --- 2. HANDLE TEXT DATA UPDATE ---
  const handleUpdate = async () => {
    try {
      setLoading(true);
      await api.put('/users/profile', {
        bio: formData.bio,
        githubUrl: formData.githubUrl,
        linkedinUrl: formData.linkedinUrl,
        portfolioUrl: formData.portfolioUrl,
        skills: formData.skills
      });
      toast.success("Professional Portfolio Synchronized!");
      onUpdate(); 
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. SKILL MANAGEMENT ---
  const addSkill = () => {
    if (formData.newSkill.trim() && !formData.skills.includes(formData.newSkill.trim())) {
      setFormData({ 
        ...formData, 
        skills: [...formData.skills, formData.newSkill.trim()],
        newSkill: "" 
      });
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skillToRemove)
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* --- ELITE HEADER SECTION --- */}
      <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden group">
        
        {/* Avatar with Upload Overlay */}
        <div className="relative shrink-0">
          <div className="w-36 h-36 bg-blue-600 rounded-[3rem] overflow-hidden flex items-center justify-center text-5xl font-black border-4 border-white/10 shadow-2xl transition-transform duration-500 group-hover:scale-105">
            {userInfo?.profilePicture ? (
              <img src={userInfo.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              userInfo?.name?.[0]
            )}
          </div>
          <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 hover:opacity-100 transition-opacity rounded-[3rem] cursor-pointer backdrop-blur-sm">
            <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
            <FaCamera className="text-2xl mb-2" />
            <span className="text-[9px] font-black uppercase tracking-widest">{uploading ? "Uploading..." : "Change Photo"}</span>
          </label>
        </div>

        <div className="flex-1 text-center md:text-left z-10">
          <h2 className="text-4xl font-black tracking-tight mb-2">{userInfo?.name}</h2>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <span className="bg-white/10 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
              {userInfo?.rollNo || "ADMIN"}
            </span>
            <span className="bg-white/10 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              {userInfo?.department}
            </span>
          </div>
        </div>

        <div className="absolute top-[-20%] right-[-10%] w-72 h-72 bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT: PROFESSIONAL INFO --- */}
        <div className="lg:col-span-7 space-y-8">
          
          <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">About Me / Professional Bio</h3>
            <textarea 
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              placeholder="Describe your technical interests, project contributions, and career goals..."
              className="w-full h-44 bg-slate-50 rounded-[2rem] p-6 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 outline-none border-none resize-none transition-all"
            />
          </section>

          <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Social Repositories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <InputField 
                 icon={<FaGithub />} label="GitHub URL" value={formData.githubUrl} 
                 onChange={(v) => setFormData({...formData, githubUrl: v})} 
               />
               <InputField 
                 icon={<FaLinkedin />} label="LinkedIn URL" value={formData.linkedinUrl} 
                 onChange={(v) => setFormData({...formData, linkedinUrl: v})} 
               />
               <InputField 
                 icon={<FaGlobe />} label="Portfolio Website" value={formData.portfolioUrl} 
                 onChange={(v) => setFormData({...formData, portfolioUrl: v})} 
               />
               <InputField 
                 icon={<FaEnvelope />} label="Contact Email" value={userInfo?.email} 
                 readOnly={true}
               />
            </div>
          </section>
        </div>

        {/* --- RIGHT: TECH STACK & ACTIONS --- */}
        <div className="lg:col-span-5 space-y-8">
          
          <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Technical Stack</h3>
              <FaCode className="text-blue-600" />
            </div>
            
            <div className="flex flex-wrap gap-2 mb-8 min-h-[40px]">
              {formData.skills.map((skill, i) => (
                <span key={i} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-3 animate-in zoom-in duration-300">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="text-white/40 hover:text-rose-400 transition-colors">
                    <FaTimes size={10} />
                  </button>
                </span>
              ))}
              {formData.skills.length === 0 && <p className="text-[10px] text-slate-300 font-black uppercase italic">No skills added yet</p>}
            </div>

            <div className="flex gap-2">
              <input 
                value={formData.newSkill}
                onChange={(e) => setFormData({...formData, newSkill: e.target.value})}
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                placeholder="Ex: React, AWS, Python"
                className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold outline-none focus:border-blue-200 transition-all"
              />
              <button onClick={addSkill} className="bg-blue-600 text-white w-14 h-14 rounded-2xl shadow-xl shadow-blue-200 flex items-center justify-center hover:bg-blue-700 transition-colors">
                <FaPlus />
              </button>
            </div>
          </section>

          <button 
            onClick={handleUpdate}
            disabled={loading}
            className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50"
          >
            {loading ? "Synchronizing..." : <><FaSave /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- REUSABLE SUB-COMPONENTS ---
const InputField = ({ icon, label, value, onChange, readOnly = false }) => (
  <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${readOnly ? 'bg-slate-50 border-transparent' : 'bg-white border-slate-100 focus-within:border-blue-200 focus-within:shadow-md'}`}>
    <div className="text-blue-600 shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{label}</p>
      <input 
        value={value} 
        readOnly={readOnly}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="w-full bg-transparent text-sm font-bold text-slate-800 outline-none" 
      />
    </div>
  </div>
);

export default ProfileTab;