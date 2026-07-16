import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Share, Download, FileText, Loader2, MoreVertical, Trash2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PdfThumbnail from '../components/PdfThumbnail';
import { api } from '../lib/api';

const Workspace = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to permanently delete this document?")) return;
    
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

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await api.get('/documents');
      return response.data;
    }
  });

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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '-- MB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="flex h-screen w-full bg-[#13141a] overflow-hidden text-white font-sans">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative h-full bg-[#0d0e12]">
        
        {/* Top Navbar */}
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#121319]">
          <div className="flex space-x-6 h-full">
            <button className="h-full border-b-2 border-indigo-500 text-indigo-400 font-medium px-1 flex items-center transition-colors text-[15px]">
              Documents
            </button>
            <button className="h-full border-b-2 border-transparent text-gray-400 hover:text-gray-200 font-medium px-1 flex items-center transition-colors text-[15px]">
              Analysis
            </button>
            <button className="h-full border-b-2 border-transparent text-gray-400 hover:text-gray-200 font-medium px-1 flex items-center transition-colors text-[15px]">
              History
            </button>
          </div>

          <div className="flex items-center space-x-6 text-sm text-gray-400">
            <button className="hover:text-white transition-colors">Share</button>
            <button className="hover:text-white transition-colors">Export</button>
            <div className="w-px h-4 bg-white/10 mx-2"></div>
            <button className="hover:text-white transition-colors relative">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full"></span>
            </button>
          </div>
        </div>

        {/* Content Wrapper */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Library Section */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <h1 className="text-3xl font-bold text-white mb-8 tracking-tight">My Library</h1>

            {/* Search and Filters */}
            <div className="flex items-center space-x-4 mb-8">
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search documents, text, or entities..." 
                  className="w-full bg-[#181a22] border border-white/10 text-sm text-white placeholder-gray-500 rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                />
              </div>
              <div className="flex space-x-2">
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
                filteredDocs.map((doc) => {
                  return (
                  <div 
                    key={doc.id} 
                    onClick={() => {
                      if (doc.status === 'ready') {
                        navigate('/dashboard', { state: { activeDocumentId: doc.id } });
                      }
                    }}
                    className={`bg-[#181a22] border border-white/5 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all group ${doc.status === 'ready' ? 'cursor-pointer' : 'cursor-default opacity-80'} flex flex-col h-[280px] relative`}
                  >
                    {/* Card Image Area */}
                    <div className="h-[120px] bg-[#121319] relative overflow-hidden shrink-0 border-b border-white/5 flex items-center justify-center">
                      {doc.status === 'ready' && doc.s3_url && (
                        <div className="absolute inset-0 w-full h-[300px] pointer-events-none opacity-80 mix-blend-screen scale-90">
                           <PdfThumbnail url={doc.s3_url} />
                        </div>
                      )}
                      
                      <div className={`absolute inset-0 z-10 ${doc.status === 'ready' ? 'opacity-70 bg-gradient-to-t from-[#181a22] to-indigo-900/40' : 'opacity-40 bg-gradient-to-br from-indigo-900/40 to-[#121319]'}`} />
                      
                      {/* Status Badge */}
                      <div className="absolute top-3 left-3 z-20">
                        {doc.status === 'ready' ? (
                          <span className="bg-emerald-500/20 text-emerald-300 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-emerald-500/30">
                            Ready
                          </span>
                        ) : doc.status === 'processing' ? (
                          <span className="bg-orange-500/10 text-orange-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-orange-500/20 flex items-center gap-1.5">
                            <Loader2 size={10} className="animate-spin" /> Processing
                          </span>
                        ) : (
                          <span className="bg-red-500/10 text-red-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-red-500/20">
                            Failed
                          </span>
                        )}
                      </div>

                      {doc.status === 'processing' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin"></div>
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-[15px] font-semibold text-gray-200 truncate pr-2 leading-tight">
                          {doc.filename}
                        </h3>
                      </div>
                      
                      {/* Type, processing state, and Actions */}
                      <div className="flex items-center justify-between w-full text-xs text-gray-400 mb-auto mt-1 z-40 relative">
                        {doc.status === 'processing' ? (
                          <span className="flex items-center gap-1.5 text-gray-500">
                            <span className="w-1 h-1 bg-gray-500 rounded-full animate-ping"></span>
                            Extracting Entities...
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <FileText size={12} />
                            {doc.filename.toLowerCase().endsWith('.pdf') ? 'PDF' : 'DOCX'}
                          </span>
                        )}

                        {doc.status === 'ready' && (
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(doc.s3_url, '_blank');
                              }}
                              className="text-gray-400 hover:text-indigo-400 transition-colors p-1"
                              title="Download"
                            >
                              <Download size={15} />
                            </button>
                            <button 
                              onClick={(e) => handleDelete(doc.id, e)}
                              disabled={deletingId === doc.id}
                              className="text-red-500 hover:text-red-400 transition-colors p-1"
                              title="Delete Document"
                            >
                              {deletingId === doc.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Meta footer */}
                      <div className="flex items-center justify-between text-[11px] text-gray-500 mt-4 border-t border-white/5 pt-3">
                        <div className="flex items-center gap-2">
                          <span>{doc.status === 'processing' ? '--' : (doc.pages || '--')} Pages</span>
                          <span>•</span>
                          <span>{formatFileSize(doc.file_size)}</span>
                        </div>
                        <span>{formatDate(doc.created_at)}</span>
                      </div>
                    </div>
                  </div>
                )})
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-[300px] border-l border-white/5 bg-[#121319] p-6 flex flex-col overflow-y-auto shrink-0">
            {/* Storage Widget */}
            <div className="bg-[#181a22] border border-white/5 rounded-2xl p-5 mb-6">
              <h3 className="text-[15px] font-semibold text-white mb-4">Storage</h3>
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Used</span>
                <span>45 GB</span>
              </div>
              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-6">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[60%] rounded-full"></div>
              </div>
              <button className="text-indigo-400 text-xs font-medium w-full text-right hover:text-indigo-300 transition-colors">
                Upgrade Plan
              </button>
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
    </div>
  );
};

export default Workspace;
