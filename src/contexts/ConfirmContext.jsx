import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmContext = createContext(null);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

export const ConfirmProvider = ({ children }) => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    isDanger: false,
    withInput: false,
    inputValue: '',
    resolve: null,
  });

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title: options.title || 'Are you sure?',
        message: options.message || '',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        isDanger: options.isDanger || false,
        withInput: options.withInput || false,
        inputValue: options.defaultValue || '',
        resolve,
      });
    });
  }, []);

  const handleConfirm = () => {
    if (confirmState.resolve) {
      confirmState.resolve(confirmState.withInput ? confirmState.inputValue : true);
    }
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    if (confirmState.resolve) {
      confirmState.resolve(confirmState.withInput ? null : false);
    }
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      
      {/* Modal Backdrop */}
      <div 
        className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${
          confirmState.isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleCancel}
        ></div>
        
        {/* Modal Content */}
        <div 
          className={`bg-[#181a22] border border-white/10 rounded-2xl w-full max-w-md relative shadow-2xl flex flex-col transform transition-all duration-300 ${
            confirmState.isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
          }`}
        >
          <div className="p-6 pb-0 flex items-start gap-4">
            <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${confirmState.isDanger ? 'bg-red-500/10 text-red-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
              <AlertTriangle size={20} />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-lg font-bold text-white mb-2">{confirmState.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{confirmState.message}</p>
            </div>
            <button 
              onClick={handleCancel}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          {confirmState.withInput && (
            <div className="px-6 mt-4">
              <input 
                type="text" 
                value={confirmState.inputValue}
                onChange={(e) => setConfirmState(prev => ({ ...prev, inputValue: e.target.value }))}
                className="w-full bg-[#121319] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirm();
                }}
              />
            </div>
          )}
          
          <div className="p-6 flex justify-end gap-3 mt-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              {confirmState.cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors shadow-lg ${
                confirmState.isDanger 
                  ? 'bg-red-600 hover:bg-red-500 shadow-red-500/20' 
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'
              }`}
            >
              {confirmState.confirmText}
            </button>
          </div>
        </div>
      </div>
    </ConfirmContext.Provider>
  );
};
