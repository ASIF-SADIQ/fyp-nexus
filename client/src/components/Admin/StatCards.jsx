import React from 'react';
import { 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaHourglassHalf, 
  FaProjectDiagram, 
  FaCheckCircle,
  FaChevronRight
} from "react-icons/fa";
import { motion } from 'framer-motion';

const StatCards = ({ stats, projects, setActiveTab, setSearchTerm }) => {
  // Real-time computation of project lifecycle stages
  const pending = projects.filter(p => p.status === "Pending").length;
  const live = projects.filter(p => p.status === "Approved").length;
  const completed = projects.filter(p => p.status === "Completed").length;

  const diveIntoProjects = (status) => {
    setActiveTab("allocation");
    if (setSearchTerm) {
      setSearchTerm(status); 
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
      {/* --- Personnel Metrics --- */}
      <Card 
        label="Total Students" 
        val={stats.students} 
        icon={<FaUserGraduate />} 
        theme="blue" 
        onClick={() => { setActiveTab("students"); setSearchTerm(""); }} 
      />
      <Card 
        label="Faculty Pool" 
        val={stats.teachers} 
        icon={<FaChalkboardTeacher />} 
        theme="purple" 
        onClick={() => { setActiveTab("teachers"); setSearchTerm(""); }} 
      />

      {/* --- Project Lifecycle Deep Dives --- */}
      <Card 
        label="Awaiting Review" 
        val={pending} 
        icon={<FaHourglassHalf />} 
        theme="orange" 
        onClick={() => diveIntoProjects("Pending")} 
        isAlert={pending > 0}
      />
      <Card 
        label="Active Research" 
        val={live} 
        icon={<FaProjectDiagram />} 
        theme="emerald" 
        onClick={() => diveIntoProjects("Approved")} 
      />
      <Card 
        label="Archived/Done" 
        val={completed} 
        icon={<FaCheckCircle />} 
        theme="slate" 
        onClick={() => diveIntoProjects("Completed")} 
      />
    </div>
  );
};

const Card = ({ label, val, icon, theme, onClick, isAlert }) => {
  // Mapping themes to Tailwind classes
  const themes = {
    blue: "text-blue-600 bg-blue-50 border-blue-100/50",
    purple: "text-purple-600 bg-purple-50 border-purple-100/50",
    orange: "text-orange-600 bg-orange-50 border-orange-100/50",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100/50",
    slate: "text-slate-600 bg-slate-50 border-slate-100/50"
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick} 
      className={`relative overflow-hidden bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between cursor-pointer transition-all group`}
    >
      {/* Decorative background shape */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity ${themes[theme].split(' ')[1]}`} />

      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${themes[theme].split(' ')[1]} ${themes[theme].split(' ')[0]} transition-colors group-hover:bg-slate-900 group-hover:text-white`}>
          {React.cloneElement(icon, { size: 18 })}
        </div>
        {isAlert && (
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
        )}
      </div>

      <div>
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-1">
          {val}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-black uppercase opacity-40 tracking-widest group-hover:opacity-100 transition-opacity">
            {label}
          </p>
          <FaChevronRight className="text-slate-200 group-hover:text-slate-900 transition-colors" size={8} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCards;