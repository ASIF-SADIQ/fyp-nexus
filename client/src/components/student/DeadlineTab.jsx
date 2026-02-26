import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FaCalendarCheck, FaHourglassHalf, FaExclamationCircle, FaCloudUploadAlt, FaInbox, FaCheckCircle, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';

// ============================================================================
// 1. THE NEXT DEADLINE BANNER COMPONENT (Dynamic Color Logic Included)
// ============================================================================
const NextDeadlineBanner = ({ deadline, isSubmitted, onSubmitClick }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [theme, setTheme] = useState({
    bg: 'bg-slate-800', 
    card: 'bg-slate-900/50',
    badge: 'bg-slate-600',
    textHighlight: 'text-slate-300',
    priorityText: 'Standard Priority',
    pulse: false
  });

  useEffect(() => {
    if (!deadline || !deadline.deadlineDate) return;

    const targetDate = new Date(deadline.deadlineDate);

    const calculateTimeLeft = () => {
      const difference = targetDate - new Date();
      const daysLeft = Math.ceil(difference / (1000 * 60 * 60 * 24));

      // DYNAMIC COLOR LOGIC
      if (daysLeft <= 3) {
        setTheme({
          bg: 'bg-[#5c1a26]', 
          card: 'bg-[#46121c]',
          badge: 'bg-[#EF4444]', 
          textHighlight: 'text-rose-300',
          priorityText: 'Critical Priority',
          pulse: true
        });
      } else if (daysLeft <= 7) {
        setTheme({
          bg: 'bg-amber-900', 
          card: 'bg-amber-950/50',
          badge: 'bg-[#F59E0B]', 
          textHighlight: 'text-amber-300',
          priorityText: 'High Priority',
          pulse: false
        });
      } else {
        setTheme({
          bg: 'bg-emerald-900', 
          card: 'bg-emerald-950/50',
          badge: 'bg-emerald-600', 
          textHighlight: 'text-emerald-300',
          priorityText: 'On Track',
          pulse: false
        });
      }

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  if (!deadline) return null;

  const formatTime = (time) => time.toString().padStart(2, '0');
  const isOverdue = new Date() > new Date(deadline.deadlineDate) && !isSubmitted;

  return (
    <div className="mb-10">
      <div className="flex justify-between items-end mb-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400">Next Major Goal</h3>
        <button className="text-xs font-bold text-blue-600 uppercase tracking-wider hover:underline">
          Full Roadmap &gt;
        </button>
      </div>

      <div className={`${theme.bg} text-white rounded-3xl p-8 relative overflow-hidden shadow-lg transition-colors duration-500`}>
        <div className="flex items-center gap-3 mb-4">
          <span className={`${theme.badge} text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1`}>
            {theme.pulse && <FaExclamationTriangle className="animate-pulse" />} {isOverdue ? "OVERDUE" : theme.priorityText}
          </span>
          {isSubmitted && (
            <span className="bg-emerald-800/80 text-emerald-200 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-600/50">
              <FaCheckCircle /> Record Secured
            </span>
          )}
        </div>

        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-4xl font-black capitalize tracking-tight mb-2">{deadline.title}</h2>
            <div className={`flex items-center gap-2 text-sm ${theme.textHighlight} font-medium`}>
              <FaCalendarAlt />
              <span>
                Due {new Date(deadline.deadlineDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </span>
            </div>
          </div>
          {isSubmitted && (
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1">Global Status</span>
              <span className="text-emerald-400 font-black tracking-widest mb-2">SUBMITTED</span>
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
                <FaCheckCircle />
              </div>
            </div>
          )}
        </div>

        <div className={`${theme.card} rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-sm`}>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black">{formatTime(timeLeft.days)}</span>
              <span className={`text-[10px] ${theme.textHighlight} font-bold uppercase tracking-widest`}>Days</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black">{formatTime(timeLeft.hours)}</span>
              <span className={`text-[10px] ${theme.textHighlight} font-bold uppercase tracking-widest`}>Hrs</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black">{formatTime(timeLeft.minutes)}</span>
              <span className={`text-[10px] ${theme.textHighlight} font-bold uppercase tracking-widest`}>Min</span>
            </div>
            <div className="flex flex-col items-center">
              <span className={`text-3xl font-black ${theme.pulse ? 'animate-pulse text-white' : ''}`}>{formatTime(timeLeft.seconds)}</span>
              <span className={`text-[10px] ${theme.textHighlight} font-bold uppercase tracking-widest opacity-80`}>Sec</span>
            </div>
          </div>

          <button 
            onClick={onSubmitClick}
            className={`px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-transform hover:scale-105 active:scale-95 ${
              isSubmitted 
                ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-900/50 shadow-lg" 
                : "bg-white text-slate-900 hover:bg-neutral-100 shadow-black/20 shadow-lg"
            }`}
          >
            {isSubmitted ? "Update Existing Submission" : "Submit Deliverable Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. YOUR MAIN DEADLINETAB COMPONENT
// ============================================================================
const DeadlineTab = ({ deadlines = [] }) => {
  const hasDeadlines = Array.isArray(deadlines) && deadlines.length > 0;

  // Find the closest upcoming deadline that is NOT overdue
  const nextUpcomingDeadline = hasDeadlines 
    ? deadlines
        .filter(d => new Date(d.deadlineDate) >= new Date()) // Keep only future deadlines
        .sort((a, b) => new Date(a.deadlineDate) - new Date(b.deadlineDate))[0] // Sort and grab the closest one
    : null;

  const handleSubmissionClick = () => {
    // Add logic here to open your upload modal
    console.log("Submission button clicked!");
  };

  if (!hasDeadlines) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border-2 border-dashed border-neutral-100">
        <div className="w-20 h-20 bg-neutral-50 text-neutral-200 rounded-full flex items-center justify-center mb-6">
          <FaInbox size={40} />
        </div>
        <h3 className="text-xl font-black text-neutral-400 uppercase tracking-widest">No Deadlines Found</h3>
        <p className="text-neutral-400 text-sm mt-2 max-w-xs text-center">
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
      {/* 🌟 RENDER THE BANNER AT THE TOP */}
      {nextUpcomingDeadline && (
        <NextDeadlineBanner 
          deadline={nextUpcomingDeadline} 
          isSubmitted={false} // Update this based on your project's submission state
          onSubmitClick={handleSubmissionClick}
        />
      )}

      {/* RENDER THE LIST OF ALL DEADLINES */}
      <div className="grid grid-cols-1 gap-6">
        {deadlines.map((deadline) => {
          const targetDate = new Date(deadline.deadlineDate);
          const isOverdue = targetDate < new Date();
          
          return (
            <div 
              key={deadline._id}
              className={`bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:shadow-md`}
            >
              <div className="flex items-center gap-6 flex-1">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl ${
                  isOverdue ? 'bg-error-100 text-error-600' : 'bg-primary-100 text-primary-600'
                }`}>
                  <FaHourglassHalf />
                </div>
                
                <div>
                  <h4 className="text-xl font-black text-neutral-900">{deadline.title}</h4>
                  <p className="text-neutral-400 text-sm font-medium mt-1">{deadline.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">Target Date</p>
                  <p className={`text-sm font-black mt-1 ${isOverdue ? 'text-error-500' : 'text-neutral-900'}`}>
                    {targetDate.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>

                <div className="flex flex-col items-center">
                   <span className="px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest bg-neutral-100 text-neutral-500">
                     {deadline.type || 'Deliverable'}
                   </span>
                   {isOverdue && (
                     <span className="flex items-center gap-1 text-error-500 text-xs font-black mt-2 uppercase">
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