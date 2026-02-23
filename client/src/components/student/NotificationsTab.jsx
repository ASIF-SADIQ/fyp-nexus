import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { 
  FaBell, FaCheckCircle, FaExclamationCircle, FaInfoCircle, 
  FaClipboardCheck, FaEnvelopeOpen, FaTasks 
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const NotificationsTab = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch Notifications (Wrapped in useCallback for the interval)
  const fetchNotifications = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const { data } = await api.get('/notifications/my');
      setNotifications(data);
    } catch (error) {
      if (!isSilent) toast.error("Failed to sync notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    
    // ✅ AUTO-REFRESH: Check for new tasks every 30 seconds
    const interval = setInterval(() => fetchNotifications(true), 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // ✅ Handler: Mark single as read & Navigate
  const handleNotificationClick = async (n) => {
    if (!n.isRead) {
      try {
        await api.put(`/notifications/${n._id}/read`);
        setNotifications(prev => prev.map(item => item._id === n._id ? { ...item, isRead: true } : item));
      } catch (error) {
        toast.error("Status update failed.");
      }
    }
    
    // Redirect user to the project or dashboard if a link exists
    if (n.link) {
        window.location.href = n.link;
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success("Inbox cleared!");
    } catch (error) { 
      toast.error("Failed to clear notifications."); 
    }
  };

  // ✅ Helper: Get Icon based on Type
  const getIcon = (type) => {
    switch (type) {
      case 'Task': return <FaTasks className="text-amber-500" />;
      case 'Grade': return <FaClipboardCheck className="text-purple-500" />;
      case 'Approval': return <FaCheckCircle className="text-emerald-500" />;
      case 'Rejection': return <FaExclamationCircle className="text-rose-500" />;
      default: return <FaInfoCircle className="text-blue-500" />;
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Fetching Comms...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto p-4">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             Notification Center 
             {notifications.some(n => !n.isRead) && (
                <span className="bg-rose-500 text-white text-[10px] px-2 py-1 rounded-lg">
                    {notifications.filter(n => !n.isRead).length} New
                </span>
             )}
           </h2>
           <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Project Updates & Assignments</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button 
            onClick={markAllRead}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors active:scale-95"
          >
            <FaEnvelopeOpen /> Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-4">
        <AnimatePresence mode='popLayout'>
          {notifications.length > 0 ? notifications.map((n) => (
            <motion.div 
              key={n._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => handleNotificationClick(n)}
              className={`relative p-6 rounded-[1.5rem] border transition-all cursor-pointer group hover:shadow-md
                ${n.isRead ? 'bg-slate-50/50 border-slate-100 opacity-80' : 'bg-white border-blue-100 shadow-sm hover:border-blue-300'}
              `}
            >
              {!n.isRead && (
                <span className="absolute top-6 right-6 w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse" />
              )}

              <div className="flex items-start gap-5">
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-slate-50 ${n.isRead ? 'bg-slate-100' : 'bg-blue-50'}`}>
                    {getIcon(n.type)}
                 </div>

                 <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                       <h4 className={`text-sm font-black tracking-tight ${n.isRead ? 'text-slate-600' : 'text-slate-900'}`}>
                        {n.title}
                       </h4>
                       <span className="text-[9px] font-bold text-slate-400 uppercase">
                         {new Date(n.createdAt).toLocaleDateString()}
                       </span>
                    </div>
                    <p className={`text-xs font-medium leading-relaxed ${n.isRead ? 'text-slate-400' : 'text-slate-600'}`}>
                      {n.message}
                    </p>
                 </div>
              </div>
            </motion.div>
          )) : (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
               <FaBell className="mx-auto text-slate-200 text-4xl mb-4" />
               <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No notifications yet</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotificationsTab;