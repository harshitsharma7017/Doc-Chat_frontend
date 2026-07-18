import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { HelpCircle, Shield, FileText, MessageSquare } from 'lucide-react';
import Uploader from '../components/Uploader';
import ChatInterface from '../components/ChatInterface';
import Sidebar from '../components/Sidebar';
import { api } from '../lib/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [activeDocumentId, setActiveDocumentId] = useState(location.state?.activeDocumentId || null);

  // Basic Auth Check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch Documents using TanStack Query to find the active document
  const { data: documents } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await api.get('/documents');
      return response.data;
    }
  });

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries(['documents']);
  };

  const activeDocument = documents?.find(d => d.id === activeDocumentId);

  return (
    <div className="flex h-[100dvh] w-full bg-[#0d0e12] overflow-hidden text-white font-sans">
      <Sidebar onDocumentClick={setActiveDocumentId} activeDocumentId={activeDocumentId} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative h-full bg-[#0a0a0c]">
        {activeDocumentId ? (
          <ChatInterface document={activeDocument} onClose={() => setActiveDocumentId(null)} />
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
            <div className="max-w-4xl mx-auto w-full p-5 pt-16 md:p-8 md:pt-10 flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center mb-8 md:mb-16 border-b border-white/5 pb-4">
                <h2 className="text-[15px] font-medium text-gray-200">New Analysis</h2>
                <HelpCircle size={18} className="text-gray-400 cursor-pointer hover:text-white transition-colors" />
              </div>

              {/* Hero Section */}
              <div className="text-center mb-10 md:mb-14">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 md:mb-5 tracking-tight leading-[1.15]">
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
              <div className="max-w-[576px] mx-auto w-full mb-10">
                <h3 className="text-[11px] font-semibold text-gray-500 tracking-wider mb-4 uppercase text-center md:text-left">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="hidden lg:flex w-[340px] border-l border-white/5 bg-[#121319] flex-col p-8 overflow-y-auto shrink-0">
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
              <p className="text-xs text-gray-500 leading-relaxed">Doc-Chat breaks down the text, charts, and tables into a semantic vector map.</p>
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
