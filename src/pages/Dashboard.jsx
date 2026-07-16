import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  LogOut, FileText, MessageSquare, Loader2, Trash2, 
  LayoutGrid, Folder, Search, Settings, HelpCircle, Shield, Upload, User 
} from 'lucide-react';
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
    <div className="flex h-screen w-full bg-[#0d0e12] overflow-hidden text-white font-sans">
      {/* Left Sidebar */}
      <div className="w-64 border-r border-white/5 bg-[#121319] flex flex-col justify-between shrink-0">
        <div className="p-4 flex flex-col h-full overflow-hidden">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 mb-8 mt-2 cursor-pointer" onClick={() => setActiveDocumentId(null)}>
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/20">
              <FileText size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide">Lumina</h1>
              <p className="text-[10px] text-gray-400 tracking-wider">Document Intelligence</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1 overflow-y-auto custom-scrollbar flex-1 -mx-2 px-2 pb-4">
            <div className="flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
              <LayoutGrid size={18} />
              <span className="font-medium text-sm">Workspace</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
              <Folder size={18} />
              <span className="font-medium text-sm">Collections</span>
            </div>
            
            {/* Recent Chats / Documents */}
            <div className="mt-4 mb-1">
              <div className="flex items-center gap-3 px-3 py-2.5 text-gray-200 bg-white/5 rounded-lg transition-colors cursor-pointer">
                <MessageSquare size={18} className="text-indigo-400" />
                <span className="font-medium text-sm">Recent Chats</span>
              </div>
              
              <div className="pl-9 pr-1 space-y-0.5 mt-1">
                {isLoading && (
                  <div className="py-2 text-xs text-indigo-400 flex items-center">
                    <Loader2 className="animate-spin mr-2" size={14} /> Loading...
                  </div>
                )}
                {isError && (
                  <div className="py-2 text-xs text-red-400">Failed to load</div>
                )}
                {!isLoading && !isError && documents?.length === 0 && (
                  <div className="py-2 text-xs text-gray-500">No chats yet.</div>
                )}
                {!isLoading && !isError && documents?.map((doc) => (
                  <div 
                    key={doc.id}
                    onClick={() => { if (doc.status === 'ready') setActiveDocumentId(doc.id); }}
                    className={`group flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer transition-colors ${
                      activeDocumentId === doc.id ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                    } ${doc.status !== 'ready' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {doc.status === 'processing' && <Loader2 size={12} className="animate-spin shrink-0 text-yellow-500" />}
                      {doc.status === 'failed' && <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}
                      <span className="text-[13px] truncate" title={doc.filename}>{doc.filename}</span>
                    </div>
                    <button 
                      onClick={(e) => handleDelete(doc.id, e)}
                      disabled={deletingId === doc.id}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity shrink-0"
                    >
                      {deletingId === doc.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer mt-4">
              <Search size={18} />
              <span className="font-medium text-sm">Search</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
              <Settings size={18} />
              <span className="font-medium text-sm">Settings</span>
            </div>
          </div>
        </div>

        {/* Sidebar Footer Actions */}
        <div className="p-4 border-t border-white/5">
          <button 
            onClick={() => setActiveDocumentId(null)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg text-sm font-medium transition-colors shadow-sm mb-4"
          >
            <Upload size={16} />
            Upload Document
          </button>
          
          <div className="flex items-center justify-between px-2 cursor-pointer hover:bg-white/5 py-2 rounded-lg transition-colors" onClick={handleLogout} title="Logout">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full border border-gray-600 flex items-center justify-center bg-gray-800 shrink-0">
                <User size={14} className="text-gray-400" />
              </div>
              <span className="text-sm font-medium text-gray-300">Profile</span>
            </div>
            <LogOut size={14} className="text-gray-500 hover:text-white transition-colors" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative h-full bg-[#0a0a0c]">
        {activeDocumentId ? (
          <ChatInterface document={activeDocument} onClose={() => setActiveDocumentId(null)} />
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
            <div className="max-w-4xl mx-auto w-full p-8 pt-10 flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center mb-16 border-b border-white/5 pb-4">
                <h2 className="text-[15px] font-medium text-gray-200">New Analysis</h2>
                <HelpCircle size={18} className="text-gray-400 cursor-pointer hover:text-white transition-colors" />
              </div>

              {/* Hero Section */}
              <div className="text-center mb-14">
                <h1 className="text-5xl font-bold text-white mb-5 tracking-tight leading-[1.15]">
                  Understand Your <br /> Documents <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-400">Instantly</span>
                </h1>
                <p className="text-gray-400 text-[15px] max-w-lg mx-auto leading-relaxed">
                  Upload PDFs, reports, research papers, contracts, or notes and chat with them using AI.
                </p>
              </div>

              {/* Uploader Zone */}
              <div className="mb-14">
                <Uploader onUploadSuccess={handleUploadSuccess} />
              </div>

              {/* Quick Actions */}
              <div className="max-w-[576px] mx-auto w-full">
                <h3 className="text-[11px] font-semibold text-gray-500 tracking-wider mb-4 uppercase">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#14151a] border border-white/5 p-5 rounded-xl flex gap-4 hover:border-white/10 hover:bg-[#1a1b22] transition-colors cursor-pointer group">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                      <FileText size={18} className="text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-medium text-gray-200 mb-1.5">Summarize a PDF</h4>
                      <p className="text-[11px] text-gray-500 leading-relaxed">Extract the core thesis and main arguments instantly.</p>
                    </div>
                  </div>
                  <div className="bg-[#14151a] border border-white/5 p-5 rounded-xl flex gap-4 hover:border-white/10 hover:bg-[#1a1b22] transition-colors cursor-pointer group">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                      <MessageSquare size={18} className="text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-medium text-gray-200 mb-1.5">Explain a contract</h4>
                      <p className="text-[11px] text-gray-500 leading-relaxed">Translate legal jargon into plain, actionable language.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar (Only visible when no document is active) */}
      {!activeDocumentId && (
        <div className="w-[340px] border-l border-white/5 bg-[#121319] flex flex-col p-8 overflow-y-auto shrink-0">
          <h3 className="text-[15px] font-medium text-white mb-10">Getting Started</h3>
          
          <div className="relative border-l border-white/10 ml-3.5 space-y-10 mb-12">
            <div className="relative pl-7">
              <div className="absolute -left-[14px] top-0 w-7 h-7 rounded-full bg-[#1c1e26] border-[3px] border-[#121319] flex items-center justify-center text-[10px] font-semibold text-gray-400">1</div>
              <h4 className="text-[13px] font-medium text-gray-200 mb-2 mt-0.5">Upload Securely</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Your documents are encrypted end-to-end and are never used to train public models.</p>
            </div>
            
            <div className="relative pl-7">
              <div className="absolute -left-[14px] top-0 w-7 h-7 rounded-full bg-[#1c1e26] border-[3px] border-[#121319] flex items-center justify-center text-[10px] font-semibold text-gray-400">2</div>
              <h4 className="text-[13px] font-medium text-gray-200 mb-2 mt-0.5">Processing Phase</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Lumina breaks down the text, charts, and tables into a semantic vector map.</p>
            </div>
            
            <div className="relative pl-7">
              {/* Highlighted Step */}
              <div className="absolute -left-[14px] top-0 w-7 h-7 rounded-full bg-violet-600 border-[3px] border-[#121319] flex items-center justify-center text-[10px] font-bold text-white shadow-[0_0_12px_rgba(124,58,237,0.6)]">3</div>
              <h4 className="text-[13px] font-medium text-violet-300 mb-2 mt-0.5">Start Chatting</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Ask complex questions, request formatting changes, or generate new content based on the source.</p>
            </div>
          </div>

          <div className="mt-auto bg-[#181a22] border border-white/5 p-5 rounded-2xl relative overflow-hidden group">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-indigo-500/20"></div>
            
            <div className="flex items-center gap-2 mb-3 text-indigo-400 relative z-10">
              <Shield size={16} />
              <h4 className="text-[13px] font-medium text-gray-200">Enterprise Grade Security</h4>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed relative z-10">
              SOC2 Type II Compliant. HIPAA ready environment available on request.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
