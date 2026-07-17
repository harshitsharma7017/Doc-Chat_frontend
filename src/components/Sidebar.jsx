import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  LogOut, FileText, MessageSquare, Loader2, Trash2, 
  LayoutGrid, Folder, Search, Settings, Upload, User, Plus, Edit2
} from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';

const Sidebar = ({ onDocumentClick, activeDocumentId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [deletingId, setDeletingId] = useState(null);

  // Fetch Documents using TanStack Query
  const { data: documents, isLoading: isLoadingDocs, isError: isErrorDocs } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await api.get('/documents');
      return response.data;
    }
  });

  // Fetch User Profile
  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await api.get('/users/me');
      return response.data;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    const isConfirmed = await confirm({
      title: "Delete Document",
      message: "Are you sure you want to permanently delete this document and its AI context?",
      isDanger: true,
      confirmText: "Delete"
    });
    
    if (!isConfirmed) return;
    
    setDeletingId(id);
    try {
      await api.delete(`/documents/${id}`);
      queryClient.invalidateQueries(['documents']);
      if (activeDocumentId === id && onDocumentClick) {
        onDocumentClick(null);
      }
    } catch (err) {
      console.error('Failed to delete document', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleRename = async (id, currentFilename, currentPreferred, e) => {
    e.stopPropagation();
    const newName = await confirm({
      title: "Rename Document",
      message: "Enter a new name for this document:",
      withInput: true,
      defaultValue: currentPreferred || currentFilename,
      confirmText: "Save"
    });
    
    if (newName && newName.trim() !== "" && newName !== currentPreferred) {
      try {
        await api.put(`/documents/${id}/rename`, { preferredName: newName.trim() });
        queryClient.invalidateQueries(['documents']);
      } catch (err) {
        console.error('Failed to rename document', err);
        showToast("Failed to rename document.", 'error');
      }
    }
  };

  // Check if current route is workspace
  const isWorkspace = location.pathname === '/workspace';
  const isCollections = location.pathname === '/collections';

  return (
    <div className="w-64 border-r border-white/5 bg-[#121319] flex flex-col justify-between shrink-0 h-screen font-sans text-white">
      <div className="p-4 flex flex-col h-full overflow-hidden">
        {/* Logo */}
        <div 
          className="flex items-center gap-3 px-2 mb-6 mt-2 cursor-pointer" 
          onClick={() => {
            navigate('/dashboard');
            if (onDocumentClick) onDocumentClick(null);
          }}
        >
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/20">
            <FileText size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">Doc-Chat</h1>
            <p className="text-[10px] text-gray-400 tracking-wider">Document Intelligence</p>
          </div>
        </div>

        {/* Upload Document Button */}
        <button 
          onClick={() => {
            navigate('/dashboard');
            if (onDocumentClick) onDocumentClick(null);
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg text-sm font-medium transition-colors shadow-sm mb-6"
        >
          <Plus size={16} />
          Upload Document
        </button>

        {/* Navigation Links */}
        <div className="space-y-1 overflow-y-auto custom-scrollbar flex-1 -mx-2 px-2 pb-4">
          <div 
            onClick={() => navigate('/workspace')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
              isWorkspace ? 'bg-indigo-500/10 text-indigo-300' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutGrid size={18} />
            <span className="font-medium text-sm">Workspace</span>
          </div>
          <div 
            onClick={() => navigate('/collections')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
              isCollections ? 'bg-indigo-500/10 text-indigo-300' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Folder size={18} />
            <span className="font-medium text-sm">Collections</span>
          </div>
          
          {/* Recent Chats / Documents */}
          <div className="mt-4 mb-1">
            <div 
              onClick={() => navigate('/dashboard')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                !isWorkspace ? 'bg-white/5 text-gray-200' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <MessageSquare size={18} className={!isWorkspace ? "text-indigo-400" : ""} />
              <span className="font-medium text-sm">Recent Chats</span>
            </div>
            
            <div className="pl-9 pr-1 space-y-0.5 mt-1">
              {isLoadingDocs && (
                <div className="py-2 text-xs text-indigo-400 flex items-center">
                  <Loader2 className="animate-spin mr-2" size={14} /> Loading...
                </div>
              )}
              {isErrorDocs && (
                <div className="py-2 text-xs text-red-400">Failed to load</div>
              )}
              {!isLoadingDocs && !isErrorDocs && documents?.length === 0 && (
                <div className="py-2 text-xs text-gray-500">No chats yet.</div>
              )}
              {!isLoadingDocs && !isErrorDocs && documents?.map((doc) => (
                <div 
                  key={doc.id}
                  onClick={() => { 
                    if (doc.status === 'ready') {
                      if (onDocumentClick) {
                        onDocumentClick(doc.id);
                      } else {
                        navigate('/dashboard', { state: { activeDocumentId: doc.id } });
                      }
                    }
                  }}
                  className={`group flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer transition-colors ${
                    activeDocumentId === doc.id && !isWorkspace ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                  } ${doc.status !== 'ready' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-2 overflow-hidden w-full pr-1">
                    {doc.status === 'processing' && <Loader2 size={12} className="animate-spin shrink-0 text-yellow-500" />}
                    {doc.status === 'failed' && <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}
                    <div className="flex flex-col truncate w-full">
                      <span className="text-[13px] truncate" title={doc.preferred_name || doc.filename}>
                        {doc.preferred_name || doc.filename}
                      </span>
                      {doc.preferred_name && (
                        <span className="text-[9px] text-gray-500 truncate" title={doc.filename}>
                          {doc.filename}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
                    <button 
                      onClick={(e) => handleRename(doc.id, doc.filename, doc.preferred_name, e)}
                      className="p-1 hover:text-indigo-400 transition-colors"
                      title="Rename"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(doc.id, e)}
                      disabled={deletingId === doc.id}
                      className="p-1 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      {deletingId === doc.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer mt-4">
            <Search size={18} />
            <span className="font-medium text-sm">Search</span>
          </div>
        <div className="pt-4 border-t border-white/5">
          <a 
            onClick={() => navigate('/settings')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all ${
              location.pathname === '/settings' 
                ? 'bg-indigo-500/10 text-indigo-400 font-medium' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <Settings size={20} />
            <span className="text-sm">Settings</span>
          </a>
        </div>
        </div>
      </div>

      {/* Sidebar Footer Actions */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center justify-between px-2 cursor-pointer hover:bg-white/5 py-2 rounded-lg transition-colors group">
          <div 
            className="flex items-center gap-3 flex-1 overflow-hidden pr-2"
            onClick={() => navigate('/settings')}
            title="Profile Settings"
          >
            <div className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center bg-gray-800 shrink-0 overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="User" className="w-full h-full object-cover" />
              ) : (
                <User size={16} className="text-gray-400" />
              )}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-[13px] font-medium text-gray-200 truncate">
                {profile?.name || 'Profile'}
              </span>
              {profile?.email && (
                <span className="text-[10px] text-gray-500 truncate">
                  {profile.email}
                </span>
              )}
            </div>
          </div>
          <LogOut 
            size={16} 
            className="text-gray-500 hover:text-red-400 transition-colors shrink-0" 
            onClick={handleLogout} 
            title="Logout" 
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
