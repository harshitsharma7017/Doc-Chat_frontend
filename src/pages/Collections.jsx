import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Share, History, FolderPlus, MoreVertical, Folder, Loader2, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { api } from '../lib/api';
import { useToast } from '../contexts/ToastContext';

const Collections = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCollection, setNewCollection] = useState({ name: '', description: '' });

  const { data: collections, isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const response = await api.get('/collections');
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/collections', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['collections']);
      setIsModalOpen(false);
      setNewCollection({ name: '', description: '' });
    },
    onError: (err) => {
      console.error(err);
      showToast('Failed to create collection.', 'error');
    }
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newCollection.name.trim()) return;
    createMutation.mutate(newCollection);
  };

  const filteredCollections = React.useMemo(() => {
    let cols = collections || [];
    if (searchQuery) {
      cols = cols.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return cols;
  }, [collections, searchQuery]);

  // Helper for "Last updated X ago"
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    if (diffMins > 0) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    return 'just now';
  };

  const svgPatterns = [
    `data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%234f46e5' fill-opacity='0.4' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E`,
    `data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%234f46e5' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E`,
    `data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234f46e5' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E`,
    `data:image/svg+xml,%3Csvg width='28' height='49' viewBox='0 0 28 49' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%234f46e5' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.31zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/svg%3E`,
    `data:image/svg+xml,%3Csvg width='40' height='12' viewBox='0 0 40 12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 6.172L6.172 0h5.656L0 11.828V6.172zm40 5.656L28.172 0h5.656L40 6.172v5.656zM6.172 12l12-12h5.656l12 12h-5.656L21 2.828 11.828 12H6.172zm12 0L21 9.172 23.828 12h-5.656z' fill='%234f46e5' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E`,
  ];

  const getPattern = (id) => {
    const num = String(id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return svgPatterns[num % svgPatterns.length];
  };

  return (
    <div className="flex h-screen bg-[#0b0c10] overflow-hidden font-sans text-white">
      <Sidebar />
      
      <div className="flex-1 flex flex-col relative bg-gradient-to-br from-[#0b0c10] via-[#11131a] to-[#0b0c10]">
        
        {/* Top Header */}
        <header className="h-[72px] shrink-0 border-b border-white/5 flex items-center px-8 justify-between bg-[#0b0c10]/80 backdrop-blur-md relative z-10">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-white tracking-tight">Doc-Chat</h1>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
              <span className="hover:text-gray-200 cursor-pointer transition-colors">Analysis</span>
              <span className="hover:text-gray-200 cursor-pointer transition-colors">Metadata</span>
              <span className="hover:text-gray-200 cursor-pointer transition-colors">Export</span>
            </nav>
          </div>
          
          <div className="flex items-center gap-4 text-sm font-medium text-gray-400">
            <button className="hover:text-gray-200 transition-colors"><Bell size={18} /></button>
            <button className="hover:text-gray-200 transition-colors"><History size={18} /></button>
            <button className="flex items-center gap-2 hover:text-gray-200 transition-colors ml-2">
              Share <Share size={14} />
            </button>
            <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden ml-2 cursor-pointer bg-gray-800 shrink-0">
              {/* Assuming user profile pic could be here, placeholder for now */}
              <div className="w-full h-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold">
                U
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="w-full">
            
            {/* Page Header */}
            <div className="flex justify-between items-end mb-8">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Collections</h1>
                <p className="text-gray-400 text-sm">Manage and analyze grouped document sets.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1a1b23] hover:bg-[#252630] border border-white/5 rounded-xl text-sm font-medium text-gray-200 transition-colors"
              >
                <FolderPlus size={16} className="text-gray-400" />
                New Collection
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex space-x-1 bg-[#121319] p-1 rounded-xl border border-white/5">
                {['All', 'Recent', 'Shared'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab ? 'bg-[#2a2b36] text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="relative w-80">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search collections..." 
                  className="w-full bg-[#121319] border border-white/5 text-sm text-gray-200 placeholder-gray-500 rounded-xl py-2 pl-9 pr-4 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Collections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full flex justify-center py-20 text-indigo-500">
                  <Loader2 className="animate-spin" size={32} />
                </div>
              ) : filteredCollections.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500 bg-[#15161d] rounded-2xl border border-white/5">
                  <Folder size={48} className="mb-4 opacity-50" />
                  <p>No collections found.</p>
                </div>
              ) : (
                filteredCollections.map(collection => {
                  const isComplete = collection.total_docs > 0 && collection.analyzed_docs === collection.total_docs;
                  return (
                    <div 
                      key={collection.id}
                      onClick={() => navigate(`/collections/${collection.id}`)}
                      className="bg-[#181a22] border border-white/5 hover:border-indigo-500/30 rounded-2xl p-6 transition-all cursor-pointer group flex flex-col h-[200px] relative overflow-hidden"
                    >
                      {/* SVG Background */}
                      <div 
                        className="absolute inset-0 z-0 opacity-60 transition-opacity duration-300 group-hover:opacity-100" 
                        style={{ backgroundImage: `url("${getPattern(collection.id)}")` }}
                      />
                      
                      {/* Dark Gradient Overlay to ensure text readability */}
                      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#181a22] via-[#181a22]/80 to-transparent" />

                      {/* Card Content */}
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-auto">
                          <div className="w-12 h-12 rounded-2xl bg-[#1e2029] flex items-center justify-center border border-white/5 shadow-inner">
                            <Folder size={20} className="text-indigo-400" />
                          </div>
                          <button className="text-gray-500 hover:text-gray-300 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical size={18} />
                          </button>
                        </div>

                        <div className="mt-4">
                          <h3 className="text-xl font-semibold text-white mb-1 truncate drop-shadow-sm">{collection.name}</h3>
                          <p className="text-[12px] text-gray-400 font-medium drop-shadow-sm">Last updated {getTimeAgo(collection.updated_at)}</p>
                        </div>

                        <div className="flex items-center gap-3 mt-5">
                          <span className="px-3 py-1 bg-[#1f212a]/90 backdrop-blur-sm rounded-lg text-xs font-semibold text-gray-300 border border-white/5 shadow-sm">
                            {collection.total_docs} Docs
                          </span>
                          
                          {collection.total_docs === 0 ? (
                            <span className="px-3 py-1 bg-[#252020]/90 backdrop-blur-sm rounded-lg text-xs font-semibold text-gray-400 border border-white/5 shadow-sm">
                              Empty
                            </span>
                          ) : isComplete ? (
                            <span className="px-3 py-1 bg-emerald-950/60 backdrop-blur-sm rounded-lg text-xs font-semibold text-emerald-400 border border-emerald-500/20 shadow-sm">
                              Complete
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-indigo-950/60 backdrop-blur-sm rounded-lg text-xs font-semibold text-indigo-400 border border-indigo-500/20 shadow-sm">
                              {collection.analyzed_docs}/{collection.total_docs} Analyzed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Create Collection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121319] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#15161d]">
              <h2 className="text-lg font-bold text-white tracking-tight">Create Collection</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={newCollection.name}
                    onChange={e => setNewCollection({ ...newCollection, name: e.target.value })}
                    className="w-full bg-[#181a22] border border-white/5 text-sm text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-600"
                    placeholder="e.g. Q4 Financials"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description <span className="text-gray-600 lowercase">(optional)</span></label>
                  <textarea
                    value={newCollection.description}
                    onChange={e => setNewCollection({ ...newCollection, description: e.target.value })}
                    className="w-full bg-[#181a22] border border-white/5 text-sm text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-600 resize-none h-24 custom-scrollbar"
                    placeholder="What is this collection for?"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || !newCollection.name.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                  {createMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collections;
