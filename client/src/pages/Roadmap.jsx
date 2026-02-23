import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaMapMarkedAlt, FaCalendarAlt, FaCheckCircle, FaArrowLeft, FaLayerGroup } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Roadmap = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    title: "", 
    techStack: "", 
    startDate: "", 
    endDate: "" 
  });
  const [roadmap, setRoadmap] = useState([]);
  const [loading, setLoading] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setRoadmap([]); // Clear previous

    try {
      const response = await fetch("http://localhost:5000/api/ai/roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
         setRoadmap(data);
      } else {
         toast.error("Generation Failed: " + (data.message || "Unknown Error"));
      }
    } catch (error) {
      toast.error("Server Error. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate("/dashboard")} 
            className="p-3 bg-white rounded-full shadow-sm hover:shadow-md transition text-gray-500 hover:text-blue-600"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <span className="bg-blue-100 text-blue-600 p-2 rounded-lg"><FaMapMarkedAlt /></span> 
            AI Project Timeline
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Input Panel (Takes up 4 columns) */}
          <div className="lg:col-span-4 h-fit">
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-blue-50 sticky top-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800 border-b border-gray-100 pb-4">
                <FaLayerGroup className="text-blue-600" /> Project Details
              </h2>
              
              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Project Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Smart Attendance System"
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition font-medium"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tech Stack</label>
                  <input
                    type="text"
                    placeholder="e.g. React, Node, AI"
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition font-medium"
                    value={formData.techStack}
                    onChange={(e) => setFormData({...formData, techStack: e.target.value})}
                    required
                  />
                </div>
                
                {/* DATE PICKERS */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Date</label>
                    <input
                      type="date"
                      className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-medium text-gray-600"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End Date</label>
                    <input
                      type="date"
                      className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-medium text-gray-600"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <button 
                  disabled={loading} 
                  className={`w-full py-4 mt-2 rounded-xl font-bold text-white shadow-lg transition-all ${
                    loading ? "bg-blue-300 cursor-wait" : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30 hover:scale-[1.02]"
                  }`}
                >
                  {loading ? "Calculating Schedule..." : "Generate Timeline"}
                </button>
              </form>
            </div>
          </div>

          {/* Timeline Display (Takes up 8 columns) */}
          <div className="lg:col-span-8">
             {roadmap.length > 0 ? (
               <div className="space-y-8 relative pl-4">
                 {/* The Vertical Line */}
                 <div className="absolute left-8 top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-200 via-indigo-200 to-gray-100"></div>

                 {roadmap.map((step, index) => (
                   <motion.div 
                     initial={{ opacity: 0, y: 30 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: index * 0.15 }}
                     key={index} 
                     className="relative pl-12"
                   >
                     {/* Date Bubble (The Dot on the Line) */}
                     <div className="absolute left-[22px] top-6 w-5 h-5 bg-white border-4 border-blue-600 rounded-full z-10 shadow-sm"></div>
                     
                     {/* The Card */}
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300 group">
                       <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2 border-b border-gray-50 pb-3">
                         <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-700 transition-colors">{step.phase}</h3>
                         <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide">
                           <FaCalendarAlt /> {step.dateRange}
                         </div>
                       </div>
                       
                       <div className="space-y-3">
                         {step.tasks.map((task, i) => (
                           <div key={i} className="flex items-start gap-3 text-gray-600 text-sm font-medium">
                             <FaCheckCircle className="text-green-500 mt-1 shrink-0" />
                             <span className="leading-relaxed">{task}</span>
                           </div>
                         ))}
                       </div>
                     </div>
                   </motion.div>
                 ))}
               </div>
             ) : (
               <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-400 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                 <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <FaMapMarkedAlt className="text-5xl text-gray-300" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-400">No Timeline Generated</h3>
                 <p className="mt-2 text-sm text-gray-400">Enter your project dates to build your plan.</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roadmap;