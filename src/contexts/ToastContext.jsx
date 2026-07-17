import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    requestAnimationFrame(() => setIsShowing(true));
  }, []);

  const handleClose = () => {
    setIsShowing(false);
    setTimeout(() => onRemove(toast.id), 300); // Wait for transition
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle className="text-green-400" size={18} />;
      case 'error': return <AlertCircle className="text-red-400" size={18} />;
      default: return <Info className="text-indigo-400" size={18} />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success': return 'border-green-500/20';
      case 'error': return 'border-red-500/20';
      default: return 'border-indigo-500/20';
    }
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 bg-[#13141a] border ${getBorderColor()} rounded-xl p-4 shadow-xl transform transition-all duration-300 w-80 max-w-[calc(100vw-48px)]
        ${isShowing ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}
      `}
    >
      <div className="shrink-0 mt-0.5">
        {getIcon()}
      </div>
      <div className="flex-1 text-sm font-medium text-gray-200">
        {toast.message}
      </div>
      <button 
        onClick={handleClose}
        className="shrink-0 text-gray-500 hover:text-gray-300 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};
