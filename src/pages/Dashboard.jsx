import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LogOut, FileText, MessageSquare, Loader2, Trash2, Plus } from 'lucide-react';
import Uploader from '../components/Uploader';
import ChatInterface from '../components/ChatInterface';
import { api } from '../lib/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState(null);
  const [activeDocumentId, setActiveDocumentId] = useState(null);

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
    queryClient.invalidateQueries(['documents']);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // prevent clicking the document
    if (!window.confirm("Are you sure you want to permanently delete this document and its AI context?")) {
      return;
    }
    
    setDeletingId(id);
    try {
      await api.delete(`/documents/${id}`);
      queryClient.invalidateQueries(['documents']);
      if (activeDocumentId === id) {
        setActiveDocumentId(null);
      }
    } catch (err) {
      console.error('Failed to delete document', err);
    } finally {
      setDeletingId(null);
    }
  };

  const activeDocument = documents?.find(d => d.id === activeDocumentId);

  return (
    <div className="flex h-[calc(100vh-80px)] gap-6 -mt-2">
      {/* Sidebar */}
      <div className="glass-panel w-72 rounded-2xl p-4 flex flex-col">
        <div className="flex items-center justify-between px-2 py-2 mb-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3 text-indigo-400 font-semibold">
            <MessageSquare size={20} />
            <h2>Your Documents</h2>
          </div>
          <button 
            onClick={() => setActiveDocumentId(null)}
            className="bg-indigo-500 hover:bg-indigo-400 text-white p-1.5 rounded-lg shadow-md transition-colors"
            title="Upload New Document"
          >
            <Plus size={18} />
          </button>
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
              onClick={() => {
                if (doc.status === 'ready') setActiveDocumentId(doc.id);
              }}
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer hover-lift group transition-all ${
                activeDocumentId === doc.id 
                  ? 'bg-indigo-500/20 border-indigo-500/50 text-white shadow-lg' 
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              } ${doc.status !== 'ready' ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText size={18} className="shrink-0" />
                <span className="text-sm truncate" title={doc.filename}>{doc.filename}</span>
              </div>
              {/* Actions Area */}
              <div className="shrink-0 ml-2 flex items-center gap-2">
                {/* Status Indicator */}
                {doc.status === 'processing' ? (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                  </span>
                ) : doc.status === 'failed' ? (
                  <span className="h-2 w-2 rounded-full bg-red-500 inline-block" title="Failed to process"></span>
                ) : (
                  <span className="h-2 w-2 rounded-full bg-green-500 inline-block" title="Ready to chat"></span>
                )}
                
                {/* Delete Button (visible on hover) */}
                <button 
                  onClick={(e) => handleDelete(doc.id, e)}
                  disabled={deletingId === doc.id}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-400 disabled:opacity-50"
                  title="Delete Document"
                >
                  {deletingId === doc.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* User Footer */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between px-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              {localStorage.getItem('token') ? 'U' : '?'}
            </div>
            <div className="text-sm text-slate-300 truncate font-medium">My Account</div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 rounded-2xl flex flex-col items-center justify-center relative h-full">
        {activeDocumentId ? (
          <ChatInterface document={activeDocument} onClose={() => setActiveDocumentId(null)} />
        ) : (
          <div className="glass-panel w-full h-full rounded-2xl p-8 flex flex-col items-center justify-center">
            <Uploader onUploadSuccess={handleUploadSuccess} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
