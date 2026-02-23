import React from "react";
import { motion } from "framer-motion";
import { 
  FaProjectDiagram, 
  FaUserTie, 
  FaCalendarAlt, 
  FaClipboardList,
  FaArrowRight
} from "react-icons/fa";

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const StatsRow = ({ project, deadlines = [], onOpenDeepDive }) => {
  
  // Logic helpers
  const getNextDeadline = () => {
    if (!deadlines || deadlines.length === 0) return "No Deadlines";
    const now = new Date();
    const upcoming = deadlines
      .filter(d => new Date(d.deadlineDate) > now)
      .sort((a, b) => new Date(a.deadlineDate) - new Date(b.deadlineDate));
    return upcoming.length > 0 
      ? new Date(upcoming[0].deadlineDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) 
      : "All Caught Up";
  };

  const getSupervisorStatus = () => {
    if (project?.supervisor) return project.supervisor.name;
    const pendingReq = project?.supervisionRequests?.find(r => r.requestStatus === 'Sent');
    if (pendingReq) return "Request Pending...";
    return "Not Assigned";
  };

  const getLatestFeedback = () => {
    if (project?.adminFeedback) return "Admin Directive";
    if (project?.submissions?.some(s => s.feedback)) return "Grading Evaluated";
    return "No Recent Feedback";
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    >
      <StatCard 
        title="Active Project" 
        value={project?.title || "No Title Set"} 
        icon={<FaProjectDiagram />} 
        color="blue"
        onClick={() => onOpenDeepDive('project')}
      />

      <StatCard 
        title="Faculty Mentor" 
        value={getSupervisorStatus()} 
        icon={<FaUserTie />} 
        color="purple" 
        onClick={() => onOpenDeepDive('supervisor')}
      />

      <StatCard 
        title="Next Deliverable" 
        value={getNextDeadline()} 
        icon={<FaCalendarAlt />} 
        color="orange" 
        onClick={() => onOpenDeepDive('deadline')}
      />

      <StatCard 
        title="Evaluation Logs" 
        value={getLatestFeedback()} 
        icon={<FaClipboardList />} 
        color="emerald" 
        onClick={() => onOpenDeepDive('feedback')}
      />
    </motion.div>
  );
};

// Reusable Card Component
const StatCard = ({ title, value, icon, color, onClick }) => {
  const styles = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", hoverBorder: "group-hover:border-blue-200 group-hover:ring-blue-50" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", hoverBorder: "group-hover:border-purple-200 group-hover:ring-purple-50" },
    orange: { bg: "bg-orange-50", text: "text-orange-600", hoverBorder: "group-hover:border-orange-200 group-hover:ring-orange-50" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", hoverBorder: "group-hover:border-emerald-200 group-hover:ring-emerald-50" }
  };

  const theme = styles[color] || styles.blue;

  return (
    <motion.div 
      variants={itemVariants}
      onClick={onClick}
      className={`relative group cursor-pointer bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:ring-4 ${theme.hoverBorder}`}
    >
      <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
        <FaArrowRight className={`${theme.text} text-sm`} />
      </div>

      <div className="flex items-center gap-5">
        <div className={`w-14 h-14 flex items-center justify-center rounded-2xl text-2xl shadow-inner transition-transform duration-300 group-hover:scale-110 ${theme.bg} ${theme.text}`}>
          {icon}
        </div>
        
        <div className="overflow-hidden flex-1 pr-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 group-hover:text-slate-600 transition-colors">
            {title}
          </p>
          <p className="text-sm font-black text-slate-800 truncate leading-tight">
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default StatsRow;