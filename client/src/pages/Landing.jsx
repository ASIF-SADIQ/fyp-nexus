import { motion } from "framer-motion";
import { FaChalkboardTeacher, FaCheckCircle, FaRobot, FaRocket, FaUsers } from "react-icons/fa";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 font-sans">
      
      {/* --- NAVBAR --- */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 text-2xl font-extrabold text-blue-700 tracking-tight">
          <div className="bg-blue-600 text-white p-2 rounded-lg text-lg">
            <FaUsers />
          </div>
          FYP TeamUp
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-6 py-2 text-gray-600 font-bold hover:text-blue-600 transition">
            Log In
          </Link>
          <Link to="/register" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200">
            Get Started
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="max-w-7xl mx-auto px-6 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Content */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide mb-6">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
            NOW LIVE FOR SESSION 2026
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-6">
            Build your dream <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              FYP Team.
            </span>
          </h1>
          
          <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-lg">
            Don't struggle alone. Find skilled teammates, submit proposals to supervisors, and manage your project milestones in one unified workspace.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/register" className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-xl shadow-blue-200 flex items-center justify-center gap-3">
              <FaRocket /> Start Your Journey
            </Link>
            <Link to="/login" className="px-8 py-4 bg-white text-gray-700 border border-gray-200 font-bold rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-3">
              <FaChalkboardTeacher /> Supervisor Portal
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-6 text-sm text-gray-400 font-medium">
            <div className="flex items-center gap-2"><FaCheckCircle className="text-green-500" /> Free for Students</div>
            <div className="flex items-center gap-2"><FaCheckCircle className="text-green-500" /> AI Proposal Help</div>
          </div>
        </motion.div>

        {/* Right Illustration */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.2, duration: 0.8 }}
          className="relative hidden lg:block"
        >
          {/* Main Card */}
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 relative z-20">
            <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                   <FaRobot />
                 </div>
                 <div>
                   <h3 className="font-bold text-gray-800">AI Wizard</h3>
                   <p className="text-xs text-gray-400">Generating Proposal...</p>
                 </div>
              </div>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Active</span>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-16 bg-blue-600 rounded-full"></div>
                <div className="flex-1 space-y-2">
                   <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                   <div className="h-4 bg-gray-50 rounded w-full"></div>
                   <div className="h-4 bg-gray-50 rounded w-5/6"></div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase mb-3">Suggested Teammates</p>
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => (
                     <div key={i} className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white bg-blue-${i * 300 + 400}`}>
                       U{i}
                     </div>
                   ))}
                   <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">+4</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Background Blobs */}
          <div className="absolute top-10 -right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
          <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        </motion.div>

      </main>
    </div>
  );
};

export default Landing;