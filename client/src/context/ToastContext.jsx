import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';

// 1. Create the Context
const ToastContext = createContext();

// 2. Custom Hook for easy usage
export const useToast = () => useContext(ToastContext);

// 3. Provider Component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Function to trigger a toast
  const showToast = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container - Fixed to Bottom Right */}
      <div className="fixed bottom-8 right-8 z-[99999] flex flex-col gap-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

// 4. Individual Toast UI Component
const ToastItem = ({ toast, onRemove }) => {
  const styles = {
    success: { 
      bg: 'bg-white border-emerald-100', 
      text: 'text-emerald-700', 
      icon: <FaCheckCircle className="text-emerald-500 text-2xl" /> 
    },
    error: { 
      bg: 'bg-white border-rose-100', 
      text: 'text-rose-700', 
      icon: <FaExclamationTriangle className="text-rose-500 text-2xl" /> 
    },
    info: { 
      bg: 'bg-white border-blue-100', 
      text: 'text-blue-700', 
      icon: <FaInfoCircle className="text-blue-500 text-2xl" /> 
    }
  };
  
  const current = styles[toast.type] || styles.info;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`pointer-events-auto flex items-center gap-4 p-5 min-w-[320px] max-w-md rounded-[1.5rem] border shadow-2xl ${current.bg}`}
    >
      <div className="flex-shrink-0 bg-slate-50 p-2 rounded-xl shadow-inner">
        {current.icon}
      </div>
      <span className={`font-black text-[13px] leading-tight flex-1 ${current.text}`}>
        {toast.message}
      </span>
      <button 
        onClick={onRemove} 
        className="text-slate-400 hover:text-slate-800 transition-colors p-2"
      >
        <FaTimes size={16} />
      </button>
    </motion.div>
  );
};