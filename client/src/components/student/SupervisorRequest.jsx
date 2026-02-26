import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUserTie,
  FaPaperPlane,
  FaSearch,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaLock
} from "react-icons/fa";

const SupervisorRequest = ({ teachers = [], onSendRequest, isRequesting, project }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [localLoading, setLocalLoading] = useState(null);
  const [justSent, setJustSent] = useState([]);

  /**
   * ✅ FILTER SAFE
   */
  const filteredTeachers = teachers.filter((t) =>
    t?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t?.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * ✅ STATUS DETECTOR
   */
  const getRequestStatus = (teacherId) => {
    if (justSent.includes(teacherId)) return "Sent";

    const dbRequest = project?.supervisionRequests?.find(
      (r) => r.teacherId === teacherId || r.teacherId?._id === teacherId
    );

    return dbRequest?.requestStatus || null;
  };

  /**
   * ✅ INVITE HANDLER
   */
  const handleInvite = async (teacherId) => {
    setJustSent((prev) => [...prev, teacherId]);
    setLocalLoading(teacherId);

    try {
      await onSendRequest(teacherId);
    } catch (error) {
      setJustSent((prev) => prev.filter((id) => id !== teacherId));
    } finally {
      setLocalLoading(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
        <div className="flex items-center gap-5">
            <div className="p-4 bg-primary-600 rounded-2xl text-white shadow-lg shadow-primary-200">
              <FaUserTie size={24} />
            </div>
            <div>
                <h3 className="text-2xl font-black text-neutral-900 tracking-tight">
                Faculty Directory
                </h3>
                <p className="text-neutral-400 text-xs font-black uppercase mt-1 tracking-widest">
                Real-time availability tracking
                </p>
            </div>
        </div>

        <div className="relative group w-full md:w-80">
          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-primary-500 transition-colors" />
          <input
            type="text"
            placeholder="Search name or department..."
            className="w-full pl-12 pr-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-50/50 focus:bg-white text-sm font-bold transition-all text-neutral-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TEACHER GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredTeachers.length > 0 ? filteredTeachers.map((teacher) => {

            const status = getRequestStatus(teacher._id);

            /**
             * SINGLE SOURCE OF TRUTH
             */
            const active = teacher.currentProjectsCount ?? 0;
            const max = teacher.maxProjects ?? 5;

            const isFull = active >= max;
            const isNearLimit = !isFull && active >= max - 1;
            const isLoadingThis = localLoading === teacher._id;
            const progressPercent = max > 0 ? (active / max) * 100 : 0;

            return (
              <motion.div
                key={teacher._id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`relative p-8 rounded-3xl border transition-all duration-500 overflow-hidden flex flex-col justify-between ${
                  status === "Sent"
                    ? "border-warning-200 bg-warning-50/50 shadow-sm"
                    : isFull
                    ? "border-neutral-100 bg-neutral-50 opacity-90"
                    : "bg-white border-neutral-100 shadow-sm hover:shadow-xl hover:border-primary-100 group"
                }`}
              >
                <div>
                    {/* STATUS BADGE */}
                    {(status || isFull) && (
                    <div className={`absolute top-6 right-6 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm ${
                        status === "Sent"
                        ? "bg-warning-500 text-white"
                        : isFull
                        ? "bg-neutral-800 text-white"
                        : "bg-success-500 text-white"
                    }`}>
                        {isFull && !status ? <FaLock /> :
                        status === "Sent" ? <FaPaperPlane /> : <FaCheckCircle />}
                        {isFull && !status ? "Locked" : status}
                    </div>
                    )}

                    {/* TEACHER HEADER */}
                    <div className="flex items-center gap-5 mb-8">
                    <div className="w-16 h-16 shrink-0 rounded-2xl bg-primary-50 flex items-center justify-center font-black text-xl text-primary-600 shadow-inner border border-primary-100/50 overflow-hidden group-hover:scale-105 transition-transform">
                        {teacher.profilePicture ? (
                            <img src={teacher.profilePicture} alt={teacher.name} className="w-full h-full object-cover" />
                        ) : (
                            teacher.name?.charAt(0)
                        )}
                    </div>
                    <div className="pr-12">
                        <h4 className="text-lg font-black text-neutral-900 leading-tight">{teacher.name}</h4>
                        <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mt-1">{teacher.department}</p>
                    </div>
                    </div>

                    {/* LOAD BAR */}
                    <div className={`p-5 rounded-2xl mb-8 border transition-colors ${
                    isFull ? "bg-white border-neutral-100" : "bg-neutral-50 border-neutral-100 group-hover:bg-white"
                    }`}>
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                        <FaInfoCircle /> Mentorship Load
                        </span>
                        <span className={`text-xs font-black ${
                        isFull ? "text-error-500" : "text-neutral-900"
                        }`}>
                        {active} / {max}
                        </span>
                    </div>

                    <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden shadow-inner">
                        <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progressPercent, 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${
                            isFull ? "bg-error-500" :
                            isNearLimit ? "bg-warning-400" :
                            "bg-success-500"
                        }`}
                        />
                    </div>

                    {isFull && (
                        <p className="text-xs uppercase tracking-widest text-error-500 font-bold mt-3 flex items-center justify-center gap-1.5 bg-error-50 py-1.5 rounded-lg">
                        <FaExclamationCircle /> Maximum limit reached
                        </p>
                    )}
                    </div>
                </div>

                {/* BUTTON */}
                <button
                  disabled={isRequesting || isFull || status === "Sent" || isLoadingThis}
                  onClick={() => handleInvite(teacher._id)}
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${
                    status === "Sent"
                      ? "bg-warning-500 text-white shadow-warning-500/20"
                      : isFull
                      ? "bg-neutral-100 text-neutral-400 cursor-not-allowed shadow-none"
                      : "bg-neutral-900 text-white hover:bg-primary-600 hover:shadow-primary-600/30"
                  }`}
                >
                  {isLoadingThis ? <FaSpinner className="animate-spin text-lg" /> :
                   status === "Sent" ? <><FaPaperPlane /> Request Pending</> :
                   isFull ? <><FaLock /> Portfolio Closed</> :
                   <><FaPaperPlane /> Transmit Request</>}
                </button>
              </motion.div>
            );
          }) : (
             /* EMPTY STATE */
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="col-span-full py-24 bg-white rounded-3xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center text-center"
             >
                <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
                    <FaSearch className="text-3xl text-neutral-300" />
                </div>
                <h4 className="text-lg font-black text-neutral-900 mb-1">No Faculty Found</h4>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Adjust your search parameters</p>
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SupervisorRequest;