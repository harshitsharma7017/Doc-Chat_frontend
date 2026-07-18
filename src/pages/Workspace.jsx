import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Share, Download, FileText, Loader2, MoreVertical, Trash2, X, Info, Edit2, FolderPlus, Folder } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import DocumentCard from '../components/DocumentCard';
import { api } from '../lib/api';
import { formatFileSize } from '../lib/utils';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';

const Workspace = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [deletingId, setDeletingId] = useState(null);
  const [collectionModalDocId, setCollectionModalDocId] = useState(null);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    const isConfirmed = await confirm({
      title: "Delete Document",
      message: "Are you sure you want to permanently delete this document?",
      isDanger: true,
      confirmText: "Delete"
    });
    if (!isConfirmed) return;
    
    setDeletingId(id);
    try {
      await api.delete(`/documents/${id}`);
      queryClient.invalidateQueries(['documents']);
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

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await api.get('/documents');
      return response.data;
    }
  });

  const { data: storageStats } = useQuery({
    queryKey: ['storageStats'],
    queryFn: async () => {
      const response = await api.get('/documents/storage');
      return response.data;
    }
  });

  const { data: collections, isLoading: isLoadingCollections } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const response = await api.get('/collections');
      return response.data;
    }
  });

  const addToCollectionMutation = useMutation({
    mutationFn: async ({ collectionId, documentId }) => {
      const response = await api.post(`/collections/${collectionId}/documents`, { documentId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['collections']);
      setCollectionModalDocId(null);
      showToast('Document added to collection!', 'success');
    },
    onError: (err) => {
      console.error(err);
      showToast('Failed to add document to collection.', 'error');
    }
  });

  const handleAddToCollection = (collectionId) => {
    if (!collectionModalDocId) return;
    addToCollectionMutation.mutate({ collectionId, documentId: collectionModalDocId });
  };

  // Filter documents based on search query and active filter
  const filteredDocs = React.useMemo(() => {
    let docs = documents || [];
    
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      docs = docs.filter(doc => doc.filename.toLowerCase().includes(lowerQuery));
    }
    
    if (activeFilter !== 'All') {
      if (activeFilter === 'PDF') {
        docs = docs.filter(doc => doc.filename.toLowerCase().endsWith('.pdf'));
      } else if (activeFilter === 'Contracts' || activeFilter === 'Research') {
        // Since we don't have tags in backend, we'll do a basic keyword match in filename for demo
        const keyword = activeFilter.toLowerCase();
        docs = docs.filter(doc => doc.filename.toLowerCase().includes(keyword));
      }
    }
    
    return docs;
  }, [documents, searchQuery, activeFilter]);

  // Helper to format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'Today';
    const date = new Date(dateString);
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex h-screen w-full bg-[#13141a] overflow-hidden text-white font-sans">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative h-full bg-[#0d0e12]">
        
        {/* Top Navbar */}
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-4 pl-14 md:px-8 bg-[#121319]">
          <div className="flex space-x-2 md:space-x-6 h-full">
            <button className="h-full border-b-2 border-indigo-500 text-indigo-400 font-medium px-1 flex items-center transition-colors text-[14px] md:text-[15px]">
              Documents
            </button>
            <button className="hidden sm:flex h-full border-b-2 border-transparent text-gray-400 hover:text-gray-200 font-medium px-1 items-center transition-colors text-[14px] md:text-[15px]">
              Analysis
            </button>
            <button className="hidden sm:flex h-full border-b-2 border-transparent text-gray-400 hover:text-gray-200 font-medium px-1 items-center transition-colors text-[14px] md:text-[15px]">
              History
            </button>
          </div>

          <div className="flex items-center space-x-4 md:space-x-6 text-sm text-gray-400">
            <button className="hidden sm:block hover:text-white transition-colors">Share</button>
            <button className="hidden sm:block hover:text-white transition-colors">Export</button>
            <div className="hidden sm:block w-px h-4 bg-white/10 mx-2"></div>
            <button className="hover:text-white transition-colors relative">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full"></span>
            </button>
          </div>
        </div>

        {/* Content Wrapper */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Main Library Section */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 tracking-tight">My Library</h1>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-8">
              <div className="relative w-full md:flex-1 md:max-w-md">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search documents, text, or entities..." 
                  className="w-full bg-[#181a22] border border-white/10 text-sm text-white placeholder-gray-500 rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                />
              </div>
              <div className="flex flex-wrap gap-2 md:space-x-2 w-full md:w-auto">
                {['All', 'PDF', 'Research', 'Contracts'].map(filter => (
                  <button 
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`${activeFilter === filter ? 'bg-indigo-600 text-white' : 'bg-[#181a22] border border-white/10 text-gray-300 hover:text-white hover:bg-white/5'} text-xs font-medium px-4 py-2 rounded-full transition-colors`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Document Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isLoading ? (
                <div className="col-span-full flex justify-center py-12 text-indigo-400">
                  <Loader2 className="animate-spin" size={32} />
                </div>
              ) : filteredDocs.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                  <FileText size={48} className="mb-4 opacity-50" />
                  <p>No documents found matching your criteria.</p>
                </div>
              ) : (
                filteredDocs.map((doc) => (
                  <DocumentCard 
                    key={doc.id}
                    doc={doc}
                    onClick={() => {
                      if (doc.status === 'ready') {
                        navigate('/dashboard', { state: { activeDocumentId: doc.id } });
                      }
                    }}
                    onRename={(e) => handleRename(doc.id, doc.filename, doc.preferred_name, e)}
                    onDelete={(e) => handleDelete(doc.id, e)}
                    onAddToCollection={(id) => setCollectionModalDocId(id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-[300px] border-t lg:border-t-0 lg:border-l border-white/5 bg-[#121319] p-4 md:p-6 flex flex-col overflow-y-auto shrink-0">
            {/* Storage Widget */}
            <div className="bg-[#181a22] border border-white/5 rounded-2xl p-5 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[15px] font-semibold text-white">Storage</h3>
                <button 
                  onClick={() => navigate('/storage')}
                  className="text-indigo-400 text-xs font-medium hover:text-indigo-300 transition-colors bg-indigo-500/10 px-2.5 py-1 rounded-lg"
                >
                  Detailed Info
                </button>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Used</span>
                <span>{storageStats ? formatFileSize(storageStats.usedBytes) : '-- MB'} of 10 MB</span>
              </div>
              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${storageStats ? storageStats.percentage : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Quick Stats */}
            <div>
              <h3 className="text-[15px] font-semibold text-white mb-4 px-1">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#181a22] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-white mb-1 tracking-tight">{documents?.length || 0}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Documents</span>
                </div>
                <div className="bg-[#181a22] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-white mb-1 tracking-tight">{Math.max(1, Math.floor((documents?.length || 0) / 3))}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Collections</span>
                </div>
                <div className="col-span-2 bg-[#181a22] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center mt-1">
                  <span className="text-3xl font-bold text-white mb-1 tracking-tight">{((documents?.length || 0) * 145).toLocaleString()}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Entities Extracted</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Add to Collection Modal */}
      {collectionModalDocId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121319] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#15161d] shrink-0">
              <h2 className="text-lg font-bold text-white tracking-tight">Add to Collection</h2>
              <button onClick={() => setCollectionModalDocId(null)} className="text-gray-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {isLoadingCollections ? (
                <div className="flex justify-center py-8 text-indigo-400">
                  <Loader2 className="animate-spin" size={24} />
                </div>
              ) : collections?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FolderPlus size={32} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">You don't have any collections yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {collections?.map(collection => (
                    <button
                      key={collection.id}
                      onClick={() => handleAddToCollection(collection.id)}
                      disabled={addToCollectionMutation.isPending}
                      className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-[#1a1b23] border border-transparent hover:border-white/5 transition-all text-left group disabled:opacity-50"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#1a1b23] group-hover:bg-[#252630] border border-white/5 flex items-center justify-center shrink-0">
                        <Folder size={18} className="text-indigo-400" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="text-sm font-semibold text-gray-200 truncate">{collection.name}</h4>
                        <p className="text-xs text-gray-500">{collection.total_docs} Documents</p>
                      </div>
                      {addToCollectionMutation.isPending && addToCollectionMutation.variables?.collectionId === collection.id && (
                        <Loader2 size={16} className="text-indigo-400 animate-spin" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workspace;
