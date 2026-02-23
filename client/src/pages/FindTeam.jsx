import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaArrowLeft, FaPaperPlane, FaUserAstronaut, FaCode, FaEnvelope, FaUsers } from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const FindTeam = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]); 
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    if (!userInfo) {
        navigate("/");
    } else {
        fetchUsers();
    }
  }, [search]); 

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/users?search=${search}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });

      if (response.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("userInfo");
        navigate("/");
        return;
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]); 
        console.error("API Error: Expected array but got", data);
      }
      
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]); 
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (userId, userName) => {
    try {
      const response = await fetch("http://localhost:5000/api/users/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({ recipientId: userId }), 
      });

      if (response.ok) {
        toast.success(`Invite sent to ${userName}!`);
      } else {
        toast.error("Failed to send invite.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              onClick={() => navigate("/dashboard")} 
              className="p-3 bg-white rounded-full shadow-sm hover:shadow-md transition text-gray-500 hover:text-blue-600"
            >
              <FaArrowLeft />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 p-2 rounded-lg text-xl"><FaUsers /></span>
                Find Teammates
              </h1>
              <p className="text-gray-500 font-medium text-sm mt-1">Discover talented students for your FYP.</p>
            </div>
          </div>

          <div className="relative w-full md:w-96 group">
            <FaSearch className="absolute left-4 top-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by Skill (e.g. React) or Name..." 
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-800 bg-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder-gray-400 font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20 text-gray-400 animate-pulse font-medium">
             Searching for talent...
          </div>
        )}

        {/* User Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.length > 0 && users.map((user) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={user._id} 
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-blue-100/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">
                    {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg leading-tight">{user.name}</h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <FaEnvelope className="text-[10px]" /> {user.email}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <FaCode /> Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {user.skills ? (
                      user.skills.split(',').map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg border border-blue-100">
                          {skill.trim()}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs italic">No skills listed</span>
                    )}
                  </div>
                </div>

                {user.bio && (
                    <div className="bg-gray-50 p-3 rounded-xl mb-6 border border-gray-100">
                      <p className="text-sm text-gray-500 italic line-clamp-2">"{user.bio}"</p>
                    </div>
                )}
              </div>

              <button 
               onClick={() => handleInvite(user._id, user.name)}
                className="w-full py-3 rounded-xl bg-white border-2 border-blue-50 text-blue-600 font-bold hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 group"
              >
                <FaPaperPlane className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                Send Invite
              </button>
            </motion.div>
          ))}
          
          {!loading && users.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-4xl">
                <FaUserAstronaut />
              </div>
              <h3 className="text-xl font-bold text-gray-500">No students found</h3>
              <p className="text-gray-400 mt-2">Try searching for a different skill or name.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindTeam;