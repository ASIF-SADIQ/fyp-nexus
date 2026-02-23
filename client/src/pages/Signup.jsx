import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FaUser, FaEnvelope, FaLock, FaUsers, 
  FaExclamationCircle, FaArrowRight, FaBuilding, FaLayerGroup 
} from "react-icons/fa";
import api from "../services/api"; // ✅ Professional API bridge

const Signup = () => {
  const navigate = useNavigate();
  
  // 1. STATE
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    department: "Computer Science", 
    section: "A", 
  });
  const [error, setError] = useState(""); 
  const [loading, setLoading] = useState(false); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // ✅ Using central API service instead of manual fetch
      // This automatically handles our baseURL and headers
      const { data } = await api.post("/users/register", formData);

      // ✅ Store user info for session persistence
      localStorage.setItem("userInfo", JSON.stringify(data));
      
      // ✅ Role-based redirection
      if (data.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }

    } catch (error) {
      // ✅ Professional error extraction from Axios
      setError(error.response?.data?.message || "Server Error: Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md border border-gray-100"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4">
             <FaUsers />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Join <span className="text-blue-600">FYP TeamUp</span></h1>
          <p className="text-gray-500 mt-2 font-medium">Start your project journey today.</p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 animate-pulse">
            <FaExclamationCircle className="text-xl shrink-0" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selection */}
          <div className="relative">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">I am a...</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none bg-white cursor-pointer transition-all font-medium"
            >
              <option value="student">🎓 Student</option>
              <option value="supervisor">👨‍🏫 Supervisor</option>
            </select>
          </div>

          <div className="relative">
            <FaUser className="absolute top-4 left-4 text-gray-400" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium bg-gray-50 focus:bg-white"
              required
            />
          </div>

          <div className="relative">
            <FaEnvelope className="absolute top-4 left-4 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium bg-gray-50 focus:bg-white"
              required
            />
          </div>

          {/* Department Selection */}
          <div className="relative">
            <FaBuilding className="absolute top-4 left-4 text-gray-400" />
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium bg-gray-50 focus:bg-white cursor-pointer appearance-none text-gray-700"
            >
              <option value="Computer Science">Computer Science (BSCS)</option>
              <option value="Software Engineering">Software Engineering (BSSE)</option>
              <option value="Information Technology">Information Technology (BSIT)</option>
              <option value="Data Science">Data Science (BSDS)</option>
            </select>
          </div>

          {/* Section Selection (Conditional) */}
          {formData.role === 'student' && (
            <div className="relative animate-fade-in-down">
              <FaLayerGroup className="absolute top-4 left-4 text-gray-400" />
              <select
                name="section"
                value={formData.section}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium bg-gray-50 focus:bg-white cursor-pointer appearance-none text-gray-700"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
              </select>
            </div>
          )}

          <div className="relative">
            <FaLock className="absolute top-4 left-4 text-gray-400" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium bg-gray-50 focus:bg-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 ${
              loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:scale-[1.02]"
            }`}
          >
            {loading ? "Creating Account..." : <div className="flex items-center gap-2">Create Account <FaArrowRight /></div>}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-500 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">
            Log In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;