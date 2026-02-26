import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify'; // ✅ Using premium notifications
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
      toast.success("Document submitted successfully!"); 
      onRefresh(); 
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed. Please try again."); 
    } finally {
      setUploading(false);
    }
  };

  if (!targetDeadline) return null;

  const isExpired = new Date(targetDeadline.deadlineDate) < new Date();
  const isLocked = (status === 'Missed') || (status === 'Submitted' && targetDeadline.isHardDeadline && isExpired);

  return (
    <div className={`relative transition-all duration-500 rounded-3xl overflow-hidden shadow-xl 
      ${!isExpired ? (isCritical ? 'border-error-500' : 'border-warning-500') : 'border-neutral-200'}
      bg-white border-2
    `}>
      <div className={`absolute inset-0 opacity-5 ${isCritical ? 'bg-error-500' : 'bg-primary-600'}`} />
      <FaClock className="absolute -right-6 -bottom-6 text-6xl text-neutral-200" />

      <div className="relative z-10 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest 
              ${isCritical ? 'bg-error-500 text-white' : 'bg-warning-500 text-white'}
            `}>
              {isCritical ? "Critical" : "Next Milestone"}
            </span>
            {status === 'Submitted' && <span className="text-xs font-black uppercase text-success-600">● Secured</span>}
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
            status === 'Submitted' ? 'bg-success-500 text-white' : isCritical ? 'bg-error-500 text-white' : 'bg-primary-500 text-white'
          }`}>
            {status === 'Submitted' ? <FaCheckCircle /> : <FaHourglassHalf />}
          </div>
        </div>

        <h3 className="text-xl font-black text-neutral-900 tracking-tight">{targetDeadline.title}</h3>
        <p className="text-neutral-500 text-xs font-bold uppercase mt-1 flex items-center gap-1">
          <FaCalendarCheck className="text-primary-500" /> Due {new Date(targetDeadline.deadlineDate).toLocaleDateString()}
        </p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
          <div className="flex justify-around text-center">
            {[{ l: 'D', v: timeLeft.days }, { l: 'H', v: timeLeft.hours }, { l: 'M', v: timeLeft.mins }, { l: 'S', v: timeLeft.secs }].map((u, i) => (
              <div key={i}>
                <p className={`text-lg font-black ${isCritical ? 'text-error-600' : 'text-neutral-800'}`}>{u.v.toString().padStart(2, '0')}</p>
                <p className="text-xs font-black uppercase text-neutral-500">{u.l}</p>
              </div>
            ))}
          </div>

          <div>
            {isLocked ? (
              <div className="py-3 rounded-xl bg-neutral-100 text-neutral-500 text-xs font-black uppercase text-center border border-neutral-200">
                <FaLock className="inline mr-2" /> Locked
              </div>
            ) : (
              <>
                <input type="file" id="small-up" className="hidden" onChange={handleFileUpload} accept=".pdf" disabled={uploading}/>
                <label htmlFor="small-up" className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md
                  ${status === 'Submitted' ? 'bg-success-600 text-white hover:bg-success-700' : isCritical ? 'bg-error-600 text-white hover:bg-error-700' : 'bg-primary-600 text-white hover:bg-primary-700'}
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