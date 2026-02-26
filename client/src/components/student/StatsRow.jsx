import React from 'react';
import { FaProjectDiagram, FaUserTie, FaCalendarAlt, FaClipboardList } from 'react-icons/fa';
import { motion } from 'framer-motion';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const StatsRow = ({ project, deadlines, onOpenDeepDive }) => {
  
  // 1. Determine Next Deliverable Date
  const nextUpcomingDeadline = deadlines && deadlines.length > 0 
    ? deadlines
        .filter(d => new Date(d.deadlineDate) >= new Date()) 
        .sort((a, b) => new Date(a.deadlineDate) - new Date(b.deadlineDate))[0] 
    : null;

  // 2. 🛑 THE FIX: Dynamically find the latest feedback!
  const getLatestFeedbackSnippet = () => {
    if (!project) return "No Recent Feedback";
    
    // Check for Final Grade feedback first
    if (project.grade?.feedback) return project.grade.feedback;
    
    // Check for milestone submission feedback (gets the most recent one)
    if (project.submissions?.length > 0) {
      const withFeedback = [...project.submissions].reverse().find(s => s.feedback);
      if (withFeedback) return withFeedback.feedback;
    }
    
    // Check for admin directives
    if (project.adminFeedback) return project.adminFeedback;
    
    // Default if nothing has been evaluated yet
    return "No Recent Feedback";
  };

  const latestFeedback = getLatestFeedbackSnippet();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      
      {/* Card 1: Active Project */}
      <motion.div variants={itemVariants} onClick={() => onOpenDeepDive('project')} className="bg-white p-5 rounded-3xl shadow-sm border border-neutral-100 flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
          <FaProjectDiagram />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">Active Project</p>
          <p className="font-bold text-neutral-800 text-sm truncate">{project?.title || "No Project Assigned"}</p>
        </div>
      </motion.div>

      {/* Card 2: Faculty Mentor */}
      <motion.div variants={itemVariants} onClick={() => onOpenDeepDive('supervisor')} className="bg-white p-5 rounded-3xl shadow-sm border border-neutral-100 flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-purple-200 transition-all group">
        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
          <FaUserTie />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">Faculty Mentor</p>
          <p className="font-bold text-neutral-800 text-sm truncate">{project?.supervisor?.name || "Pending Assignment"}</p>
        </div>
      </motion.div>

      {/* Card 3: Next Deliverable */}
      <motion.div variants={itemVariants} onClick={() => onOpenDeepDive('deadline')} className="bg-white p-5 rounded-3xl shadow-sm border border-neutral-100 flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-amber-200 transition-all group">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
          <FaCalendarAlt />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">Next Deliverable</p>
          <p className="font-bold text-neutral-800 text-sm truncate">
            {nextUpcomingDeadline 
              ? new Date(nextUpcomingDeadline.deadlineDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : "All Caught Up"}
          </p>
        </div>
      </motion.div>

      {/* Card 4: Evaluation Logs (Fixed!) */}
      <motion.div variants={itemVariants} onClick={() => onOpenDeepDive('feedback')} className="bg-white p-5 rounded-3xl shadow-sm border border-neutral-100 flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-emerald-200 transition-all group">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
          <FaClipboardList />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">Evaluation Logs</p>
          <p className="font-bold text-neutral-800 text-sm truncate">{latestFeedback}</p>
        </div>
      </motion.div>

    </div>
  );
};

export default StatsRow;