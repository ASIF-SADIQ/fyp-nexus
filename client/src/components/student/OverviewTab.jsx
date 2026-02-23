import React, { useState } from "react";
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
  FaExternalLinkAlt
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const OverviewTab = ({ project, deadlines = [] }) => {
  const [selectedProfile, setSelectedProfile] = useState(null);

  const getStatusConfig = () => {
    switch (project?.status) {
      case "Pending":
        return { color: "from-amber-500 to-orange-500 shadow-orange-500/30", icon: <FaClock />, text: "Under Review" };
      case "Approved":
        return { color: "from-emerald-400 to-teal-500 shadow-emerald-500/30", icon: <FaCheckCircle />, text: "Approved" };
      case "Ongoing":
        return { color: "from-blue-600 to-indigo-600 shadow-blue-600/30", icon: <FaUserTie />, text: "Active Supervision" };
      case "Rejected":
        return { color: "from-rose-500 to-red-600 shadow-rose-500/30", icon: <FaInfoCircle />, text: "Needs Revision" };
      default:
        return { color: "from-slate-400 to-slate-500 shadow-slate-500/30", icon: <FaInfoCircle />, text: "No Status" };
    }
  };

  const status = getStatusConfig();

  const getDaysRemaining = (date) => {
    const diff = new Date(date) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Safely parse technologies
  const techArray = Array.isArray(project?.technologies) 
    ? project.technologies 
    : project?.technologies?.split(",").filter(t => t.trim() !== "") || [];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 pb-12">

      {/* ================= STATUS BANNER ================= */}
      <motion.div variants={itemVariants} className={`p-10 rounded-[2.5rem] text-white shadow-2xl bg-gradient-to-br relative overflow-hidden ${status.color}`}>
        <div className="relative z-10 flex gap-6 items-center">
          <div className="w-16 h-16 bg-white/20 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-inner backdrop-blur-md border border-white/10">
            {status.icon}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-1">Project Status</p>
            <h2 className="text-4xl font-black tracking-tight">{status.text}</h2>
          </div>
        </div>
        {/* Decorative Background Icon */}
        <div className="absolute -right-6 -bottom-10 opacity-10 text-[12rem] pointer-events-none rotate-12">
            {status.icon}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-8">

        {/* ================= LEFT COLUMN ================= */}
        <div className="lg:col-span-8 space-y-8">

          {/* Project Details */}
          <motion.section variants={itemVariants} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <FaProjectDiagram className="text-blue-600 text-xl" />
                <h3 className="text-[10px] uppercase text-slate-400 font-black tracking-[0.2em]">
                  Executive Abstract
                </h3>
            </div>
            
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">{project?.title || "Untitled Project"}</h2>
            <p className="text-slate-600 font-medium leading-relaxed mb-8">
                {project?.description || "No description provided."}
            </p>

            {techArray.length > 0 && (
                <div>
                    <h4 className="text-[9px] uppercase text-slate-400 font-black tracking-[0.2em] mb-3 flex items-center gap-2">
                        <FaCode /> Tech Stack
                    </h4>
                    <div className="flex flex-wrap gap-2">
                    {techArray.map((tech, i) => (
                        <span key={i} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        {tech.trim()}
                        </span>
                    ))}
                    </div>
                </div>
            )}
          </motion.section>

          {/* Team Members */}
          <motion.section variants={itemVariants} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-[10px] uppercase text-slate-400 font-black tracking-[0.2em] mb-6 flex gap-3 items-center">
              <FaUsers className="text-blue-600 text-lg" /> Node Operators
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              {project?.members?.map((member, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedProfile(member)}
                  className="flex items-center gap-4 p-4 rounded-[1.5rem] border border-slate-100 cursor-pointer hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all group bg-slate-50"
                >
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xl shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                    {member.profilePicture ? (
                      <img src={member.profilePicture} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      member.name?.[0]
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-slate-800 truncate">{member.name}</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{member.rollNo}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="lg:col-span-4 space-y-8">

          {/* Supervisor */}
          <motion.section variants={itemVariants} className="bg-gradient-to-b from-slate-900 to-slate-800 p-8 rounded-[2.5rem] text-center shadow-xl border border-slate-700 relative overflow-hidden group cursor-pointer"
            onClick={() => project?.supervisor && setSelectedProfile(project.supervisor)}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-all" />
            
            <h3 className="text-[10px] uppercase text-blue-400 font-black tracking-[0.2em] mb-6 relative z-10">
                Assigned Mentor
            </h3>

            <div className="relative z-10">
                {project?.supervisor ? (
                <div>
                    <div className="w-24 h-24 mx-auto rounded-[2rem] overflow-hidden bg-slate-800 border-4 border-slate-700 mb-4 shadow-2xl group-hover:scale-105 transition-transform flex items-center justify-center">
                    {project.supervisor.profilePicture ? (
                        <img src={project.supervisor.profilePicture} className="w-full h-full object-cover" alt="Supervisor" />
                    ) : (
                        <FaUserTie className="text-3xl text-blue-400" />
                    )}
                    </div>
                    <h4 className="font-black text-white text-lg">{project.supervisor.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Lead Supervisor</p>
                </div>
                ) : (
                <div className="py-10">
                    <FaUserTie className="mx-auto text-4xl text-slate-600 mb-4" />
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Pending Assignment</p>
                </div>
                )}
            </div>
          </motion.section>

          {/* Deadlines */}
          <motion.section variants={itemVariants} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-[10px] uppercase text-slate-400 font-black tracking-[0.2em] mb-6 flex items-center gap-2">
                <FaCalendarAlt className="text-rose-500 text-lg" /> Upcoming Targets
            </h3>

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
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${isUrgent ? 'text-rose-600' : isOverdue ? 'text-slate-400' : 'text-blue-600'}`}>
                        {isOverdue ? "Overdue" : daysLeft === 0 ? "Due Today" : `${daysLeft} days left`}
                      </p>
                    </div>
                  </div>
                );
              }) : (
                 <p className="text-xs font-bold text-slate-400 italic text-center py-4">No upcoming deadlines.</p>
              )}
            </div>
          </motion.section>
        </div>
      </div>

      {/* ================= ELITE PROFILE MODAL ================= */}
      <AnimatePresence>
        {selectedProfile && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProfile(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20, transition: { duration: 0.2 } }}
              className="relative bg-white w-full max-w-4xl rounded-[3.5rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.2)] overflow-hidden border border-slate-100"
            >
              <button
                onClick={() => setSelectedProfile(null)}
                className="absolute top-6 right-6 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-2xl flex items-center justify-center transition-all z-20 shadow-lg"
              >
                <FaTimes />
              </button>

              {/* Modal Header */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 h-40 relative overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
              </div>

              <div className="grid md:grid-cols-[300px_1fr]">

                {/* Modal Sidebar */}
                <div className="bg-slate-50 p-8 border-r border-slate-100 relative">
                  <div className="-mt-24 mb-6 flex justify-center relative z-10">
                    <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl bg-blue-600 text-white flex items-center justify-center text-4xl font-black">
                      {selectedProfile.profilePicture ? (
                        <img src={selectedProfile.profilePicture} className="w-full h-full object-cover" alt="Avatar" />
                      ) : (
                        selectedProfile.name?.[0]
                      )}
                    </div>
                  </div>

                  <h2 className="text-2xl font-black text-center text-slate-900 tracking-tight">{selectedProfile.name}</h2>
                  <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mt-2 mb-8">
                    {selectedProfile.role}
                  </p>

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

                {/* Modal Main Content */}
                <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">

                  <section>
                    <h3 className="text-[10px] uppercase text-slate-400 font-black tracking-[0.2em] mb-3">
                      Professional Summary
                    </h3>
                    <p className="text-slate-600 font-medium leading-relaxed bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                      {selectedProfile.bio || "This user has not synchronized their biography yet."}
                    </p>
                  </section>

                  <section>
                    <h3 className="text-[10px] uppercase text-slate-400 font-black tracking-[0.2em] mb-4">
                      Technical Arsenal
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(selectedProfile.skills && selectedProfile.skills.length > 0 ? selectedProfile.skills : ["General Computing"]).map((s, i) => (
                        <span key={i} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-700 shadow-sm">
                          {s}
                        </span>
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
    <a 
      href={url || "#"} 
      target="_blank" 
      rel="noreferrer" 
      className={`flex-1 flex items-center justify-center p-3 rounded-xl border transition-all ${url ? 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 shadow-sm' : 'bg-slate-100 border-transparent text-slate-300 pointer-events-none'}`}
    >
      {icon}
    </a>
);

export default OverviewTab;