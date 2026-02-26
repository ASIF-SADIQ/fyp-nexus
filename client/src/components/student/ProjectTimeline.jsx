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
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100 mb-8 relative overflow-hidden group">
      
      {/* Background Accent */}
      <div className="absolute top-0 right-0 p-4 opacity-5 text-primary-600 group-hover:scale-110 transition-transform duration-700">
        <FaProjectDiagram size={160} className="-rotate-12" />
      </div>

      <div className="relative z-10">
        {/* Desktop Connecting Line Container */}
        <div className="hidden md:block absolute top-6 left-4 w-[80%] h-1 bg-neutral-100 rounded-full -z-10">
          {/* Animated Active Line Fill */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: getProgressWidth() }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute top-0 left-0 h-full bg-primary-600 rounded-full"
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
                    backgroundColor: state === 'completed' ? 'var(--success-500)' : state === 'active' ? 'var(--primary-600)' : 'var(--neutral-300)',
                    borderColor: state === 'completed' ? 'var(--success-500)' : state === 'active' ? 'var(--primary-600)' : 'var(--neutral-200)'
                  }}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all shadow-sm border-4 shrink-0 ${
                    state === 'completed' ? 'text-white' : 
                    state === 'active' ? 'text-white shadow-primary-500/30' : 
                    'text-neutral-400'
                  }`}
                >
                  {state === 'completed' ? <FaCheckCircle /> : step.icon}
                </motion.div>

                {/* Step Labels */}
                <div className="text-left md:text-center w-full">
                  <p className={`text-xs font-black uppercase tracking-widest transition-colors ${
                    state === 'pending' ? 'text-neutral-400' : 'text-neutral-900'
                  }`}>
                    {step.label}
                  </p>
                  <p className="text-xs font-bold text-neutral-400 mt-1 hidden md:block">
                    {step.description}
                  </p>
                  
                  {/* Active Pulse Badge */}
                  {state === 'active' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 md:mx-auto w-max flex items-center gap-1.5 text-xs bg-success-50 text-success-600 px-3 py-1 rounded-full font-black uppercase tracking-widest border border-success-100 shadow-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-success-600 animate-pulse" />
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