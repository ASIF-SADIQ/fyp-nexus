import React, { useState } from 'react';
import { toast } from 'react-toastify'; // Only imported ONCE here
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
      <div className="bg-neutral-900 rounded-3xl p-10 text-white flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden group">
        
        {/* Avatar with Upload Overlay */}
        <div className="relative shrink-0">
          <div className="w-36 h-36 bg-primary-600 rounded-3xl overflow-hidden flex items-center justify-center text-5xl font-black border-4 border-white/10 shadow-2xl transition-transform duration-500 group-hover:scale-105">
            {userInfo?.profilePicture ? (
              <img src={userInfo.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              userInfo?.name?.[0]
            )}
          </div>
          <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 hover:opacity-100 transition-opacity rounded-3xl cursor-pointer backdrop-blur-sm">
            <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
            <FaCamera className="text-2xl mb-2" />
            <span className="text-xs font-black uppercase tracking-widest">{uploading ? "Uploading..." : "Change Photo"}</span>
          </label>
        </div>

        <div className="flex-1 text-center md:text-left z-10">
          <h2 className="text-4xl font-black tracking-tight mb-2">{userInfo?.name}</h2>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <span className="bg-white/10 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest text-primary-400">
              {userInfo?.rollNo || "ADMIN"}
            </span>
            <span className="bg-white/10 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest text-neutral-300">
              {userInfo?.department}
            </span>
          </div>
        </div>

        <div className="absolute top-[-20%] right-[-10%] w-80 h-80 bg-primary-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT: PROFESSIONAL INFO --- */}
        <div className="lg:col-span-7 space-y-8">
          
          <section className="bg-white p-10 rounded-3xl shadow-sm border border-neutral-100">
            <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-6">About Me / Professional Bio</h3>
            <textarea 
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              placeholder="Describe your technical interests, project contributions, and career goals..."
              className="w-full h-44 bg-neutral-50 rounded-2xl p-6 text-neutral-700 font-medium focus:ring-2 focus:ring-primary-500 outline-none border-none resize-none transition-all"
            />
          </section>

          <section className="bg-white p-10 rounded-3xl shadow-sm border border-neutral-100">
            <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-6">Social Repositories</h3>
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
          
          <section className="bg-white p-10 rounded-3xl shadow-sm border border-neutral-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Technical Stack</h3>
              <FaCode className="text-primary-600" />
            </div>
            
            <div className="flex flex-wrap gap-2 mb-8 min-h-[40px]">
              {formData.skills.map((skill, i) => (
                <span key={i} className="px-4 py-2 bg-neutral-900 text-white rounded-2xl text-xs font-black uppercase flex items-center gap-2 animate-in zoom-in duration-300">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="text-white/40 hover:text-error-400 transition-colors">
                    <FaTimes size={10} />
                  </button>
                </span>
              ))}
              {formData.skills.length === 0 && <p className="text-neutral-400 font-black text-xs uppercase italic">No skills added yet</p>}
            </div>

            <div className="flex gap-2">
              <input 
                value={formData.newSkill}
                onChange={(e) => setFormData({...formData, newSkill: e.target.value})}
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                placeholder="Ex: React, AWS, Python"
                className="flex-1 bg-neutral-50 border border-neutral-100 rounded-2xl px-5 py-3 text-sm font-bold outline-none focus:border-primary-200 focus:ring-2 focus:ring-primary-500 transition-all"
              />
              <button onClick={addSkill} className="bg-primary-600 text-white w-14 h-14 rounded-2xl shadow-xl shadow-primary-200 flex items-center justify-center hover:bg-primary-700 transition-colors">
                <FaPlus />
              </button>
            </div>
          </section>

          <button 
            onClick={handleUpdate}
            disabled={loading}
            className="w-full py-6 bg-neutral-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-primary-600 transition-all shadow-xl shadow-neutral-200 active:scale-95 disabled:opacity-50"
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
  <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${readOnly ? 'bg-neutral-50 border-transparent' : 'bg-white border-neutral-100 focus-within:border-primary-200 focus-within:shadow-md'}`}>
    <div className="text-primary-600 shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-black text-neutral-400 uppercase tracking-tighter">{label}</p>
      <input 
        value={value} 
        readOnly={readOnly}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="w-full bg-transparent text-sm font-bold text-neutral-800 outline-none" 
      />
    </div>
  </div>
);

export default ProfileTab;