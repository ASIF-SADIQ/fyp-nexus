import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaUserCircle, FaGithub, FaUserEdit, FaSave, FaArrowLeft, 
  FaEnvelope, FaCode, FaBuilding, FaLayerGroup 
} from "react-icons/fa";

const Profile = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "", // ✅ Added
    section: "",    // ✅ Added
    skills: "",
    githubLink: "",
    bio: "",
    password: "" 
  });
  
  const [loading, setLoading] = useState(false);

  // 1. Check if user is logged in & Fetch Data
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userInfo"));
    if (!storedUser) {
      navigate("/");
    } else {
      setUserInfo(storedUser);
      fetchProfile(storedUser.token);
    }
  }, [navigate]);

  // 2. Fetch Profile Data from Backend
  const fetchProfile = async (token) => {
    try {
      const response = await fetch("http://localhost:5000/api/users/me", { // ✅ Changed to /me (standard)
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (response.ok) {
        setFormData({
          name: data.name || "",
          email: data.email || "",
          department: data.department || "Computer Science", // ✅ Fetch Dept
          section: data.section || "A",                      // ✅ Fetch Section
          skills: data.skills || "",
          githubLink: data.githubLink || "",
          bio: data.bio || "",
          password: "" 
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  // 3. Update Profile Data
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Update Local Storage so the name updates in the navbar immediately
        const updatedUser = { ...userInfo, name: data.name, department: data.department };
        localStorage.setItem("userInfo", JSON.stringify(updatedUser));
        setUserInfo(updatedUser);
        alert("Profile Updated Successfully!");
      } else {
        alert("Update Failed: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      alert("Server Error");
    } finally {
      setLoading(false);
    }
  };

  // Safe navigation back based on role
  const handleBack = () => {
    if (userInfo?.role === 'admin') navigate('/admin-dashboard');
    else if (userInfo?.role === 'supervisor') navigate('/supervisor-dashboard');
    else navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-6 text-gray-900">
      <div className="max-w-5xl mx-auto">
        
        {/* Back Button */}
        <button 
          onClick={handleBack} 
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-8 font-bold transition group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: ID Card Preview */}
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center h-fit sticky top-6">
            <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-6xl text-blue-600 shadow-inner">
               <FaUserCircle />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">{formData.name}</h2>
            
            {/* Role Badge */}
            <p className="text-blue-600 font-bold uppercase text-xs tracking-wider mt-2 bg-blue-50 py-1 px-3 rounded-full inline-block mb-6">
              {userInfo?.role}
            </p>
            
            {/* ID Card Details */}
            <div className="space-y-3 text-left">
               <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-xl text-sm font-bold border border-gray-100">
                 <FaEnvelope className="text-gray-400 text-lg" /> 
                 <div className="truncate">{formData.email}</div>
               </div>
               
               {/* 👇 NEW: Department Display */}
               <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-xl text-sm font-bold border border-gray-100">
                 <FaBuilding className="text-gray-400 text-lg" /> 
                 <div>{formData.department}</div>
               </div>

               {/* 👇 NEW: Section Display */}
               <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-xl text-sm font-bold border border-gray-100">
                 <FaLayerGroup className="text-gray-400 text-lg" /> 
                 <div>Section: {formData.section}</div>
               </div>
            </div>

            {formData.githubLink && (
              <a 
                href={formData.githubLink} 
                target="_blank" 
                rel="noreferrer" 
                className="mt-6 flex items-center gap-3 text-white bg-gray-900 p-3 rounded-xl text-sm hover:bg-black transition font-bold justify-center shadow-lg shadow-gray-200"
              >
                <FaGithub /> GitHub Profile
              </a>
            )}
          </div>

          {/* RIGHT COLUMN: Edit Form */}
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
              <FaUserEdit className="text-blue-600" /> Edit Your Profile
            </h3>
            
            <form onSubmit={handleUpdate} className="space-y-6">
              
              {/* Name & Github Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">GitHub URL</label>
                  <input 
                    type="text" 
                    placeholder="https://github.com/username" 
                    className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" 
                    value={formData.githubLink} 
                    onChange={(e) => setFormData({...formData, githubLink: e.target.value})} 
                  />
                </div>
              </div>

              {/* 👇 NEW: Department & Section Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Department</label>
                  <select 
                    className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 outline-none font-medium"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Data Science">Data Science</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Section</label>
                  <input 
                    type="text" 
                    placeholder="e.g. A, B, Morning" 
                    className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" 
                    value={formData.section} 
                    onChange={(e) => setFormData({...formData, section: e.target.value})} 
                  />
                </div>
              </div>

              {/* Skills Input */}
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-2">
                  <FaCode /> Skills (Comma Separated)
                </label>
                <input 
                  type="text" 
                  placeholder="React, Node.js, Python, Machine Learning" 
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" 
                  value={formData.skills} 
                  onChange={(e) => setFormData({...formData, skills: e.target.value})} 
                />
              </div>

              {/* Bio Input */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Bio / About Me</label>
                <textarea 
                  rows="4" 
                  placeholder="I am a final year student looking for teammates..." 
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none resize-none font-medium" 
                  value={formData.bio} 
                  onChange={(e) => setFormData({...formData, bio: e.target.value})} 
                ></textarea>
              </div>

              {/* Save Button */}
              <div className="pt-6 border-t border-gray-100 flex justify-end">
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                >
                  {loading ? "Saving..." : <><FaSave /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile; 