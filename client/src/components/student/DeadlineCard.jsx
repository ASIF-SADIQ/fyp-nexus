import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast'; // ✅ Using premium notifications
import { 
  FaClock, 
  FaCloudUploadAlt, 
  FaCheckCircle, 
  FaLock, 
  FaHourglassHalf,
  FaCalendarCheck
} from 'react-icons/fa';
import api from '../../services/api';

const DeadlineCard = ({ deadlines = [], project, onRefresh }) => {
  const [targetDeadline, setTargetDeadline] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [isCritical, setIsCritical] = useState(false);
  const [status, setStatus] = useState('Pending'); 
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!deadlines.length) return;
    setTargetDeadline(deadlines[0]);
  }, [deadlines]);

  useEffect(() => {
    if (!targetDeadline || !project) return;

    const submission = project.submissions?.find(s => s.deadlineId === targetDeadline._id);
    const due = new Date(targetDeadline.deadlineDate);

    setStatus(submission ? 'Submitted' : (new Date() > due ? (targetDeadline.isHardDeadline ? 'Missed' : 'Late') : 'Pending'));

    const timer = setInterval(() => {
      const diff = due - new Date();
      if (diff <= 0) {
        setIsCritical(false);
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
        clearInterval(timer);
        return;
      }
      setIsCritical((diff / (1000 * 60 * 60)) <= 48);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / 1000 / 60) % 60),
        secs: Math.floor((diff / 1000) % 60)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDeadline, project]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('deadlineId', targetDeadline._id);
    
    try {
      await api.post(`/projects/${project._id}/submit`, formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      toast.success("Document submitted successfully!"); // ✅ Added Success Toast
      onRefresh(); 
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed. Please try again."); // ✅ Replaced ugly alert
    } finally {
      setUploading(false);
    }
  };

  if (!targetDeadline) return null;

  const isExpired = new Date(targetDeadline.deadlineDate) < new Date();
  const isLocked = (status === 'Missed') || (status === 'Submitted' && targetDeadline.isHardDeadline && isExpired);

  return (
    <div className={`relative transition-all duration-500 rounded-[2rem] overflow-hidden shadow-lg 
      ${!isExpired ? (isCritical ? 'border-critical-blink' : 'border-next-up') : 'border-transparent'}
    `}>
      <div className={`absolute inset-0 opacity-95 ${isCritical ? 'bg-rose-950' : 'bg-slate-900'}`} />
      <FaClock className="absolute -right-6 -bottom-6 text-6xl text-white/5" />

      <div className="relative z-10 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest 
              ${isCritical ? 'bg-rose-600 text-white' : 'bg-yellow-400 text-slate-900'}
            `}>
              {isCritical ? "Critical" : "Next Milestone"}
            </span>
            {status === 'Submitted' && <span className="text-[8px] font-black uppercase text-emerald-400">● Secured</span>}
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
            status === 'Submitted' ? 'bg-emerald-500 text-white' : isCritical ? 'bg-rose-600 text-white' : 'bg-white text-slate-900'
          }`}>
            {status === 'Submitted' ? <FaCheckCircle /> : <FaHourglassHalf />}
          </div>
        </div>

        <h3 className="text-xl font-black text-white tracking-tight">{targetDeadline.title}</h3>
        <p className="text-slate-400 text-[10px] font-bold uppercase mt-1 flex items-center gap-1">
          <FaCalendarCheck className="text-blue-400" /> Due {new Date(targetDeadline.deadlineDate).toLocaleDateString()}
        </p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-black/20 p-4 rounded-2xl border border-white/5">
          <div className="flex justify-around text-center">
            {[{ l: 'D', v: timeLeft.days }, { l: 'H', v: timeLeft.hours }, { l: 'M', v: timeLeft.mins }, { l: 'S', v: timeLeft.secs }].map((u, i) => (
              <div key={i}>
                <p className={`text-lg font-black ${isCritical ? 'text-rose-400' : 'text-white'}`}>{u.v.toString().padStart(2, '0')}</p>
                <p className="text-[7px] font-black uppercase text-slate-500">{u.l}</p>
              </div>
            ))}
          </div>

          <div>
            {isLocked ? (
              <div className="py-3 rounded-xl bg-slate-800 text-slate-500 text-[9px] font-black uppercase text-center border border-white/5">
                <FaLock className="inline mr-2" /> Locked
              </div>
            ) : (
              <>
                <input type="file" id="small-up" className="hidden" onChange={handleFileUpload} accept=".pdf" disabled={uploading}/>
                <label htmlFor="small-up" className={`w-full py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md
                  ${status === 'Submitted' ? 'bg-emerald-600 text-white' : isCritical ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'}
                `}>
                  {uploading ? "Uploading..." : status === 'Submitted' ? "Update PDF" : "Submit PDF"}
                </label>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeadlineCard;