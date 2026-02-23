import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaShieldAlt, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

const ActionConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  type = "primary" // 'primary' | 'danger' | 'success'
}) => {
  if (!isOpen) return null;

  // Determine styles based on action type
  const styles = {
    primary: {
      bg: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30",
      icon: <FaShieldAlt className="text-blue-500" size={24} />,
      iconBg: "bg-blue-50 border-blue-100",
    },
    danger: {
      bg: "bg-rose-600 hover:bg-rose-700 shadow-rose-500/30",
      icon: <FaExclamationTriangle className="text-rose-500" size={24} />,
      iconBg: "bg-rose-50 border-rose-100",
    },
    success: {
      bg: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30",
      icon: <FaCheckCircle className="text-emerald-500" size={24} />,
      iconBg: "bg-emerald-50 border-emerald-100",
    }
  };

  const currentStyle = styles[type] || styles.primary;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose} 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        />
        
        {/* Modal Content */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 overflow-hidden text-center"
        >
          {/* Decorative Background Glow */}
          <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none ${currentStyle.bg.split(' ')[0]}`} />

          {/* Icon */}
          <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center border-2 shadow-inner mb-6 ${currentStyle.iconBg}`}>
            {currentStyle.icon}
          </div>

          {/* Text */}
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
            {title}
          </h3>
          <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-100 hover:text-slate-700 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 py-4 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl transition-all active:scale-95 ${currentStyle.bg}`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ActionConfirmModal;