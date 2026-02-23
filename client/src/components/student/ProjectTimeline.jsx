import React from "react";
import { motion } from "framer-motion";
import { 
  FaHourglassHalf, FaCheckCircle, FaUserTie, 
  FaAward, FaProjectDiagram // ✅ Imported native icon directly
} from "react-icons/fa";

// Defined outside component to prevent reallocation on every render
const statusOrder = ["Pending", "Approved", "Ongoing", "Completed"];

const ProjectTimeline = ({ status, hasSupervisor }) => {
  // 1. Define the logical steps of the FYP journey
  const steps = [
    { 
      label: "Proposal Submitted", 
      id: "Pending", 
      icon: <FaHourglassHalf />,
      description: "Awaiting Admin Review" 
    },
    { 
      label: "Dept. Approved", 
      id: "Approved", 
      icon: <FaCheckCircle />,
      description: "Proposal Accepted" 
    },
    { 
      label: "Supervisor Linked", 
      id: "Ongoing", 
      icon: <FaUserTie />,
      description: "Project in Progress" 
    },
    { 
      label: "Final Completion", 
      id: "Completed", 
      icon: <FaAward />,
      description: "Ready for Viva" 
    },
  ];

  /**
   * @desc Determines the visual state of each step
   * Returns: 'completed', 'active', or 'pending'
   */
  const getStepState = (stepId) => {
    if (status === "Completed") return "completed";
    if (stepId === "Ongoing" && hasSupervisor) return "completed";
    if (stepId === status) return "active";

    const currentIndex = statusOrder.indexOf(status);
    const stepIndex = statusOrder.indexOf(stepId);

    if (stepIndex < currentIndex) return "completed";
    return "pending";
  };

  /**
   * @desc Calculates the width of the animated connecting line
   */
  const getProgressWidth = () => {
    if (status === "Completed") return "100%";
    if (status === "Ongoing") return "66%";
    if (status === "Approved") return "33%";
    return "0%";
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm mb-8 relative overflow-hidden group">
      
      {/* Background Accent */}
      <div className="absolute top-0 right-0 p-4 opacity-[0.02] text-blue-600 group-hover:scale-110 transition-transform duration-700">
        <FaProjectDiagram size={160} className="-rotate-12" />
      </div>

      <div className="relative z-10">
        {/* Desktop Connecting Line Container */}
        <div className="hidden md:block absolute top-[24px] left-[10%] w-[80%] h-1 bg-slate-100 rounded-full -z-10">
            {/* Animated Active Line Fill */}
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: getProgressWidth() }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="absolute top-0 left-0 h-full bg-blue-600 rounded-full"
            />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          {steps.map((step) => {
            const state = getStepState(step.id);

            return (
              <div key={step.id} className="flex md:flex-col items-center gap-4 flex-1 w-full md:w-auto">
                
                {/* Step Icon/Circle */}
                <motion.div 
                  initial={false}
                  animate={{
                    scale: state === 'active' ? 1.15 : 1,
                    backgroundColor: state === 'completed' ? '#10B981' : state === 'active' ? '#2563EB' : '#F8FAFC',
                    borderColor: state === 'completed' ? '#10B981' : state === 'active' ? '#BFDBFE' : '#F1F5F9'
                  }}
                  className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center text-xl transition-all shadow-sm border-4 shrink-0 ${
                    state === 'completed' ? 'text-white' : 
                    state === 'active' ? 'text-white shadow-blue-500/30' : 
                    'text-slate-400'
                  }`}
                >
                  {state === 'completed' ? <FaCheckCircle /> : step.icon}
                </motion.div>

                {/* Step Labels */}
                <div className="text-left md:text-center w-full">
                  <p className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                    state === 'pending' ? 'text-slate-400' : 'text-slate-900'
                  }`}>
                    {step.label}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 mt-1 hidden md:block">
                    {step.description}
                  </p>
                  
                  {/* Active Pulse Badge */}
                  {state === 'active' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 md:mx-auto w-max flex items-center gap-1.5 text-[8px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-black uppercase tracking-widest border border-blue-100 shadow-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                      In Progress
                    </motion.div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProjectTimeline;