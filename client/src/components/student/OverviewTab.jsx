import React, { useState, useEffect } from "react";
import {
  FaCheckCircle,
  FaClock,
  FaUserTie,
  FaInfoCircle,
  FaUsers,
  FaEnvelope,
  FaIdCard,
  FaUniversity,
  FaCalendarAlt,
  FaTimes,
  FaGithub,
  FaLinkedin,
  FaProjectDiagram,
  FaCode,
  FaExternalLinkAlt,
  FaPaperPlane,
  FaExclamationTriangle,
  FaStar,
  FaInbox,
  FaClipboardList
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'react-toastify';
import { submitProjectForReview } from '../../services/api';

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

// ============================================================================
// 1. THE FULL-WIDTH RED DEADLINE BANNER COMPONENT
// ============================================================================
const NextDeadlineBanner = ({ deadline, isSubmitted, onSubmitClick }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [theme, setTheme] = useState({
    bg: 'bg-[#5c1a26]', 
    card: 'bg-[#46121c]',
    badge: 'bg-red-600',
    textHighlight: 'text-rose-300',
    priorityText: 'Critical Priority',
    pulse: true
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
          badge: 'bg-red-600', 
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

  return (
    <motion.div variants={itemVariants} className="mb-8 w-full">
      <div className="flex justify-between items-end mb-4 px-2">
        <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400">Next Major Goal</h3>
        <button className="text-xs font-bold text-blue-600 uppercase tracking-wider hover:underline">
          Full Roadmap &gt;
        </button>
      </div>

      <div className={`${theme.bg} text-white rounded-3xl p-8 md:p-10 relative overflow-hidden shadow-lg transition-colors duration-500`}>
        
        {/* Top Badges */}
        <div className="flex items-center gap-3 mb-6">
          <span className={`${theme.badge} text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full`}>
            {theme.priorityText}
          </span>
          {isSubmitted && (
            <span className="bg-emerald-800/80 text-emerald-200 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-600/50">
              <FaCheckCircle /> Record Secured
            </span>
          )}
        </div>

        {/* Title and Date */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-4xl md:text-5xl font-black capitalize tracking-tight mb-2">
              {deadline.title}
            </h2>
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

        {/* Timer & Button Bar */}
        <div className={`${theme.card} rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-sm`}>
          
          {/* Countdown Numbers */}
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black">{formatTime(timeLeft.days)}</span>
              <span className={`text-[10px] ${theme.textHighlight} font-bold uppercase tracking-widest mt-1`}>Days</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black">{formatTime(timeLeft.hours)}</span>
              <span className={`text-[10px] ${theme.textHighlight} font-bold uppercase tracking-widest mt-1`}>Hrs</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black">{formatTime(timeLeft.minutes)}</span>
              <span className={`text-[10px] ${theme.textHighlight} font-bold uppercase tracking-widest mt-1`}>Min</span>
            </div>
            <div className="flex flex-col items-center">
              <span className={`text-3xl font-black ${theme.pulse ? 'animate-pulse text-white' : ''}`}>{formatTime(timeLeft.seconds)}</span>
              <span className={`text-[10px] ${theme.textHighlight} font-bold uppercase tracking-widest mt-1 opacity-80`}>Sec</span>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={onSubmitClick}
            className={`px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-transform hover:scale-105 active:scale-95 w-full md:w-auto ${
              isSubmitted 
                ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-900/50 shadow-lg border border-emerald-500" 
                : "bg-emerald-500 text-white hover:bg-emerald-400 shadow-emerald-900/50 shadow-lg border border-emerald-400"
            }`}
          >
            {isSubmitted ? "Update Existing Submission" : "Submit Deliverable Now"}
          </button>
        </div>
        
        {/* Footer Warning */}
        <p className={`text-center text-[10px] ${theme.textHighlight} font-bold uppercase tracking-widest mt-6 opacity-60`}>
          Attention: Hard deadline approaching. Finalize your work immediately.
        </p>
      </div>
    </motion.div>
  );
};

// ============================================================================
// 2. MAIN OVERVIEW TAB COMPONENT
// ============================================================================
// ✅ ADDED: setActiveTab prop here!
const OverviewTab = ({ project, deadlines = [], onRefresh, setActiveTab }) => {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine the next active deadline
  const nextUpcomingDeadline = deadlines && deadlines.length > 0 
    ? deadlines
        .filter(d => new Date(d.deadlineDate) >= new Date()) 
        .sort((a, b) => new Date(a.deadlineDate) - new Date(b.deadlineDate))[0] 
    : null;

  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true);
      await submitProjectForReview(project._id);
      toast.success('Project submitted for final evaluation!');
      onRefresh(); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit project for review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusConfig = () => {
    switch (project?.status) {
      case "Pending": return { color: "from-amber-500 to-orange-500 shadow-amber-500/30", icon: <FaClock />, text: "Awaiting Supervisor" };
      case "Approved":
      case "Ongoing":
      case "In Progress": return { color: "from-emerald-500 to-teal-500 shadow-emerald-500/30", icon: <FaCheckCircle />, text: "Active / Approved" };
      case "Pending Evaluation":
      case "Under Review": return { color: "from-blue-500 to-indigo-500 shadow-blue-500/30", icon: <FaClock />, text: "Awaiting Final Grade" };
      case "Revision Requested": return { color: "from-rose-500 to-red-500 shadow-rose-500/30", icon: <FaExclamationTriangle />, text: "Revision Required" };
      case "Completed": return { color: "from-slate-800 to-slate-900 shadow-slate-900/30", icon: <FaCheckCircle />, text: "Project Completed" };
      case "Rejected": return { color: "from-red-600 to-red-700 shadow-red-600/30", icon: <FaInfoCircle />, text: "Project Rejected" };
      default: return { color: "from-slate-400 to-slate-500 shadow-slate-500/30", icon: <FaInfoCircle />, text: project?.status || "No Status" };
    }
  };

  const status = getStatusConfig();
  const getDaysRemaining = (date) => Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
  const techArray = Array.isArray(project?.technologies) ? project.technologies : project?.technologies?.split(",").filter(t => t.trim() !== "") || [];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 pb-12 pt-4">

      {/* ================= 1. FULL WIDTH DYNAMIC BANNER (The Red Card) ================= */}
      {/* Placed immediately at the top so it renders right below your parent component's 4 cards */}
      {nextUpcomingDeadline && (
        <NextDeadlineBanner 
          deadline={nextUpcomingDeadline} 
          isSubmitted={false} 
          onSubmitClick={() => setActiveTab("documents")} // ✅ ROUTING MAGIC HAPPENS HERE!
        />
      )}

      {/* ================= 2. FIXED STATUS BANNER (The Green Card) ================= */}
      <motion.div variants={itemVariants} className={`p-8 md:p-10 rounded-[2.5rem] text-white shadow-xl bg-gradient-to-br relative overflow-hidden ${status.color}`}>
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-2xl md:rounded-3xl flex items-center justify-center text-3xl md:text-4xl shadow-inner backdrop-blur-md border border-white/10 shrink-0">
            {status.icon}
          </div>
          <div className="mt-1 md:mt-2">
            <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] opacity-80 mb-1 md:mb-2">Project Status</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">{status.text}</h2>
          </div>
        </div>
        <div className="absolute -right-6 -bottom-10 opacity-10 text-[12rem] pointer-events-none rotate-12">
            {status.icon}
        </div>
      </motion.div>

      {/* ================= GRADING CARD ================= */}
      {project?.grade?.score !== undefined && project?.grade?.score !== null && (
        <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2.5rem] border border-emerald-100 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl shadow-inner"><FaStar /></div>
              <div>
                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Final Evaluation</h4>
                <p className="text-2xl font-black text-slate-900">Score: {project.grade.score}/100</p>
              </div>
            </div>
            <div className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm ${project.grade.score >= 60 ? 'bg-emerald-500 text-white' : project.grade.score >= 40 ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'}`}>
              {project.grade.score >= 60 ? 'Passed' : project.grade.score >= 40 ? 'Needs Improvement' : 'Failed'}
            </div>
          </div>
          {project.grade.feedback && (
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 relative z-10">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Supervisor Feedback</h5>
              <p className="text-slate-700 font-medium leading-relaxed italic border-l-4 border-emerald-300 pl-4">"{project.grade.feedback}"</p>
            </div>
          )}
        </motion.div>
      )}

      {/* ================= SUBMIT FOR REVIEW SECTION ================= */}
      {!project?.grade?.score && project.status !== 'Pending Evaluation' && project.status !== 'Under Review' && project.status !== 'Completed' && project.status !== 'Revision Requested' && project.status !== 'Pending' && (
        <motion.div variants={itemVariants} className="bg-gradient-to-r from-indigo-50 to-blue-50 p-8 rounded-[2.5rem] border border-indigo-100 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h4 className="text-xl font-black text-slate-900 mb-2">Ready for Final Review?</h4>
              <p className="text-sm font-medium text-slate-600">Submit your complete project to your supervisor for final grading.</p>
            </div>
            <button onClick={handleFinalSubmit} disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-xl hover:-translate-y-1 flex items-center justify-center gap-3 shrink-0">
              <FaPaperPlane /> {isSubmitting ? 'Submitting...' : 'Submit for Final Review'}
            </button>
          </div>
        </motion.div>
      )}

      {/* ================= REVISION REQUESTED BANNER ================= */}
      {project?.status === 'Revision Requested' && (
        <motion.div variants={itemVariants} className="bg-gradient-to-r from-rose-50 to-orange-50 p-8 rounded-[2.5rem] border border-rose-200 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-2xl shadow-inner shrink-0"><FaExclamationTriangle /></div>
            <div>
              <h4 className="text-xl font-black text-slate-900 mb-1">Revision Requested</h4>
              <p className="text-sm font-medium text-slate-700">Your supervisor requested changes. Update your deliverables, then click resubmit.</p>
            </div>
          </div>
          <button onClick={handleFinalSubmit} disabled={isSubmitting} className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-xl hover:-translate-y-1 flex items-center justify-center gap-3 shrink-0">
            <FaPaperPlane /> {isSubmitting ? 'Submitting...' : 'Resubmit Project'}
          </button>
        </motion.div>
      )}

      {/* ================= PENDING EVALUATION BANNER ================= */}
      {(project?.status === 'Pending Evaluation' || project?.status === 'Under Review') && (
        <motion.div variants={itemVariants} className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-[2.5rem] border border-amber-200 shadow-lg">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl shadow-inner shrink-0"><FaClock /></div>
            <div>
              <h4 className="text-xl font-black text-slate-900 mb-1">Project Submitted</h4>
              <p className="text-sm font-medium text-slate-700">Your project is locked and currently awaiting final evaluation from your supervisor.</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-12 gap-8 mt-4">
        {/* ================= LEFT COLUMN ================= */}
        <div className="lg:col-span-8 space-y-8">
          <motion.section variants={itemVariants} className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <FaProjectDiagram className="text-blue-600 text-xl" />
                <h3 className="text-[10px] uppercase text-slate-400 font-black tracking-widest">Executive Abstract</h3>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">{project?.title || "Untitled Project"}</h2>
            <p className="text-slate-600 font-medium leading-relaxed mb-8">{project?.description || "No description provided."}</p>
            {techArray.length > 0 && (
                <div>
                    <h4 className="text-[10px] uppercase text-slate-400 font-black tracking-widest mb-3 flex items-center gap-2"><FaCode /> Tech Stack</h4>
                    <div className="flex flex-wrap gap-2">
                    {techArray.map((tech, i) => (
                        <span key={i} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest">{tech.trim()}</span>
                    ))}
                    </div>
                </div>
            )}
          </motion.section>

          <motion.section variants={itemVariants} className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm">
            <h3 className="text-[10px] uppercase text-slate-400 font-black tracking-widest mb-6 flex gap-3 items-center"><FaUsers className="text-blue-600 text-lg" />Group members</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {project?.members?.map((member, i) => (
                <div key={i} onClick={() => setSelectedProfile(member)} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 cursor-pointer hover:border-blue-200 hover:shadow-xl transition-all group bg-slate-50">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xl shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                    {member.profilePicture ? <img src={member.profilePicture} className="w-full h-full object-cover" alt="Profile" /> : member.name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-slate-800 truncate">{member.name}</h4>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{member.rollNo}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="lg:col-span-4 space-y-8">
          <motion.section variants={itemVariants} className="bg-gradient-to-b from-slate-900 to-slate-800 p-8 rounded-3xl text-center shadow-xl border border-slate-700 relative overflow-hidden group cursor-pointer" onClick={() => project?.supervisor && setSelectedProfile(project.supervisor)}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-all" />
            <h3 className="text-[10px] uppercase text-blue-400 font-black tracking-[0.2em] mb-6 relative z-10">Assigned Mentor</h3>
            <div className="relative z-10">
                {project?.supervisor ? (
                <div>
                    <div className="w-24 h-24 mx-auto rounded-[2rem] overflow-hidden bg-slate-800 border-4 border-slate-700 mb-4 shadow-2xl group-hover:scale-105 transition-transform flex items-center justify-center">
                    {project.supervisor.profilePicture ? <img src={project.supervisor.profilePicture} className="w-full h-full object-cover" alt="Supervisor" /> : <FaUserTie className="text-3xl text-blue-400" />}
                    </div>
                    <h4 className="font-black text-white text-lg">{project.supervisor.name}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Lead Supervisor</p>
                </div>
                ) : (
                <div className="py-10">
                    <FaUserTie className="mx-auto text-4xl text-slate-600 mb-4" />
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Pending Assignment</p>
                </div>
                )}
            </div>
          </motion.section>

          <motion.section variants={itemVariants} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-[10px] uppercase text-slate-400 font-black tracking-[0.2em] mb-6 flex items-center gap-2"><FaCalendarAlt className="text-rose-500 text-lg" /> Upcoming Targets</h3>
            <div className="space-y-4">
              {deadlines?.length > 0 ? deadlines.slice(0, 3).map((d, i) => {
                const daysLeft = getDaysRemaining(d.deadlineDate);
                const isUrgent = daysLeft <= 2 && daysLeft >= 0;
                const isOverdue = daysLeft < 0;
                return (
                  <div key={i} className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${isUrgent ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
                    <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center shadow-inner ${isUrgent ? 'bg-rose-100 text-rose-600' : isOverdue ? 'bg-slate-200 text-slate-500' : 'bg-blue-100 text-blue-600'}`}>
                        <FaClock />
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-sm leading-tight mb-1">{d.title}</p>
                      <p className={`text-[9px] font-bold uppercase tracking-widest ${isUrgent ? 'text-rose-600' : isOverdue ? 'text-slate-400' : 'text-blue-600'}`}>
                        {isOverdue ? "Overdue" : daysLeft === 0 ? "Due Today" : `${daysLeft} days left`}
                      </p>
                    </div>
                  </div>
                );
              }) : (
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center py-4">No upcoming deadlines.</p>
              )}
            </div>
          </motion.section>
        </div>
      </div>

      {/* ================= ELITE PROFILE MODAL ================= */}
      <AnimatePresence>
        {selectedProfile && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProfile(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20, transition: { duration: 0.2 } }} className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.2)] overflow-hidden border border-slate-100">
              <button onClick={() => setSelectedProfile(null)} className="absolute top-6 right-6 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-2xl flex items-center justify-center transition-all z-20 shadow-lg">
                <FaTimes />
              </button>
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 h-40 relative overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
              </div>
              <div className="grid md:grid-cols-[300px_1fr]">
                <div className="bg-slate-50 p-8 border-r border-slate-100 relative">
                  <div className="-mt-24 mb-6 flex justify-center relative z-10">
                    <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl bg-blue-600 text-white flex items-center justify-center text-4xl font-black">
                      {selectedProfile.profilePicture ? <img src={selectedProfile.profilePicture} className="w-full h-full object-cover" alt="Avatar" /> : selectedProfile.name?.[0]}
                    </div>
                  </div>
                  <h2 className="text-2xl font-black text-center text-slate-900 tracking-tight">{selectedProfile.name}</h2>
                  <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mt-2 mb-8">{selectedProfile.role}</p>
                  <div className="space-y-4 mb-8">
                    <InfoRow icon={<FaUniversity />} text={selectedProfile.department || "General"} />
                    <InfoRow icon={<FaIdCard />} text={selectedProfile.rollNo || "N/A"} />
                    <InfoRow icon={<FaEnvelope />} text={selectedProfile.email} />
                  </div>
                  <div className="flex gap-3">
                    <SocialButton icon={<FaGithub />} url={selectedProfile.links?.github} />
                    <SocialButton icon={<FaLinkedin />} url={selectedProfile.links?.linkedin} />
                  </div>
                </div>
                <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  <section>
                    <h3 className="text-[10px] uppercase text-slate-400 font-black tracking-[0.2em] mb-3">Professional Summary</h3>
                    <p className="text-slate-600 font-medium leading-relaxed bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                      {selectedProfile.bio || "This user has not synchronized their biography yet."}
                    </p>
                  </section>
                  <section>
                    <h3 className="text-[10px] uppercase text-slate-400 font-black tracking-[0.2em] mb-4">Technical Arsenal</h3>
                    <div className="flex flex-wrap gap-2">
                      {(selectedProfile.skills && selectedProfile.skills.length > 0 ? selectedProfile.skills : ["General Computing"]).map((s, i) => (
                        <span key={i} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-700 shadow-sm">{s}</span>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- Sub Components ---
const InfoRow = ({ icon, text }) => (
    <div className="flex items-center gap-3 text-slate-600 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
        <span className="text-blue-500">{icon}</span>
        <span className="text-xs font-bold truncate">{text}</span>
    </div>
);

const SocialButton = ({ icon, url }) => (
    <a href={url || "#"} target="_blank" rel="noreferrer" className={`flex-1 flex items-center justify-center p-3 rounded-xl border transition-all ${url ? 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 shadow-sm' : 'bg-slate-100 border-transparent text-slate-300 pointer-events-none'}`}>
      {icon}
    </a>
);

export default OverviewTab;