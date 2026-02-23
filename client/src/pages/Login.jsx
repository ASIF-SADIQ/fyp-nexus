import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FaUsers, FaEnvelope, FaLock, FaInfoCircle, 
  FaShieldAlt, FaArrowRight 
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../services/api"; 

const Login = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await api.post("/users/login", formData);
      const { data } = response;
      
      // ✅ Deep Search for Role to match our new User Schema
      // We check data.role AND data.user.role just in case the backend nests it
      const rawRole = data.role || data.user?.role || (data.data && data.data.role);
      const userRole = rawRole ? rawRole.toLowerCase().trim() : null;

      if (!userRole) {
        toast.error("Login Successful, but no Role assigned to this account.");
        setIsSubmitting(false);
        return;
      }

      // 3. PERSISTENCE
      // Save the entire payload so we have the token for future API calls
      localStorage.setItem("userInfo", JSON.stringify(data));
      
      // 4. ROLE-BASED REDIRECT
      // Matches the 'enum' we set in models/User.js
      setTimeout(() => {
        if (userRole === 'admin') {
          navigate("/admin-dashboard");
        } else if (userRole === 'supervisor') {
          navigate("/supervisor-dashboard");
        } else if (userRole === 'student') {
          navigate("/dashboard");
        } else {
          toast.error(`Access Denied: Unrecognized role "${rawRole}"`);
        }
      }, 100);

    } catch (error) {
      // Handles the 'user.matchPassword is not a function' or 'Invalid credentials'
      const errorMsg = error.response?.data?.message || "Login Failed: Server Connection Error";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 font-sans text-gray-900">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/50"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-blue-200">
            <FaUsers />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">University Login</h1>
          <p className="text-gray-500 mt-2 font-medium italic">FYP Nexus Portal Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-4 text-gray-400" />
              <input 
                type="email" name="email" required onChange={handleChange}
                className="w-full pl-11 pr-4 py-4 rounded-2xl border border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all bg-gray-50 font-bold"
                placeholder="id@university.edu"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Secure Password</label>
            <div className="relative">
              <FaLock className="absolute left-4 top-4 text-gray-400" />
              <input 
                type="password" name="password" required onChange={handleChange}
                className="w-full pl-11 pr-4 py-4 rounded-2xl border border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all bg-gray-50 font-bold"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" disabled={isSubmitting}
            className={`w-full py-4 rounded-2xl font-black transition-all shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest text-sm active:scale-95 ${isSubmitting ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'}`}
          >
            {isSubmitting ? "Syncing..." : "Sign In"} <FaArrowRight className={isSubmitting ? "hidden" : ""} />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-50">
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="inline-flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <FaInfoCircle /> Account-Only Access
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 w-full text-left">
                    <p className="text-[11px] text-gray-500 flex items-start gap-3 leading-relaxed">
                        <FaShieldAlt className="text-blue-600 mt-1 shrink-0" />
                        <span>Registration is restricted. Credentials are pre-allocated by the Admin.</span>
                    </p>
                </div>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;