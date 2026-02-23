import React from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FaCalendarCheck, FaHourglassHalf, FaExclamationCircle, FaCloudUploadAlt, FaInbox } from 'react-icons/fa';

const DeadlineTab = ({ deadlines = [] }) => {
  // ✅ 1. Check for valid array
  const hasDeadlines = Array.isArray(deadlines) && deadlines.length > 0;

  if (!hasDeadlines) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
        <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mb-6">
          <FaInbox size={40} />
        </div>
        <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">No Deadlines Found</h3>
        <p className="text-slate-400 text-sm mt-2 max-w-xs text-center">
            Your academic roadmap is clear! Check back later for milestones assigned to your batch.
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 gap-6">
        {deadlines.map((deadline) => {
          // ✅ 2. Use 'deadlineDate' from your Admin Backend
          const targetDate = new Date(deadline.deadlineDate);
          const isOverdue = targetDate < new Date();
          
          return (
            <div 
              key={deadline._id}
              className={`bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:shadow-md`}
            >
              <div className="flex items-center gap-6 flex-1">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl ${
                  isOverdue ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  <FaHourglassHalf />
                </div>
                
                <div>
                  <h4 className="text-xl font-black text-slate-800">{deadline.title}</h4>
                  <p className="text-slate-400 text-sm font-medium mt-1">{deadline.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Date</p>
                  <p className={`text-sm font-black mt-1 ${isOverdue ? 'text-rose-500' : 'text-slate-800'}`}>
                    {targetDate.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>

                <div className="flex flex-col items-center">
                   <span className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500">
                     {deadline.type || 'Deliverable'}
                   </span>
                   {isOverdue && (
                     <span className="flex items-center gap-1 text-rose-500 text-[9px] font-black mt-2 uppercase">
                       <FaExclamationCircle /> Overdue
                     </span>
                   )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default DeadlineTab;