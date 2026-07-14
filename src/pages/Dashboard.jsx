import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LogOut, FileText, MessageSquare, Loader2 } from 'lucide-react';
import Uploader from '../components/Uploader';
import { api } from '../lib/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Basic Auth Check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch Documents using TanStack Query
  const { data: documents, isLoading, isError } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await api.get('/documents');
      return response.data;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleUploadSuccess = () => {
    // Tell React Query to refetch the documents list immediately!
    queryClient.invalidateQueries(['documents']);
  };

  return (
    <div className="flex h-[calc(100vh-80px)] gap-6 -mt-2">
      {/* Sidebar */}
      <div className="glass-panel w-72 rounded-2xl p-4 flex flex-col">
        <div className="flex items-center gap-3 px-2 py-3 text-indigo-400 font-semibold mb-4 border-b border-white/10">
          <MessageSquare size={20} />
          <h2>Your Documents</h2>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {isLoading && (
            <div className="flex items-center justify-center p-4 text-indigo-400">
              <Loader2 className="animate-spin" size={24} />
            </div>
          )}
          
          {isError && (
            <div className="text-red-400 text-sm text-center p-4 bg-red-500/10 rounded-xl">
              Failed to load documents.
            </div>
          )}

          {!isLoading && !isError && documents?.length === 0 && (
            <div className="text-[var(--color-text-muted)] text-sm text-center p-4">
              No documents yet. Upload one!
            </div>
          )}

          {!isLoading && !isError && documents?.map((doc) => (
            <div 
              key={doc.id}
              className="flex items-center justify-between p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 cursor-pointer hover-lift group"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText size={18} className="shrink-0" />
                <span className="text-sm truncate" title={doc.filename}>{doc.filename}</span>
              </div>
              {/* Status Indicator */}
              <div className="shrink-0 ml-2">
                {doc.status === 'processing' ? (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                  </span>
                ) : doc.status === 'failed' ? (
                  <span className="h-2 w-2 rounded-full bg-red-500 inline-block"></span>
                ) : (
                  <span className="h-2 w-2 rounded-full bg-green-500 inline-block"></span>
                )}
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={handleLogout}
          className="mt-auto flex items-center justify-center gap-2 w-full p-3 rounded-xl hover:bg-white/5 text-[var(--color-text-muted)] transition-colors"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="glass-panel flex-1 rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 w-full flex flex-col items-center">
          <Uploader onUploadSuccess={handleUploadSuccess} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
