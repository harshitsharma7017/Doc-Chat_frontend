import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Bell, Share, History, FolderPlus, ArrowLeft, Loader2, FileText, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import DocumentCard from '../components/DocumentCard';
import { api } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';

const CollectionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Collection Details (includes documents)
  const { data: collection, isLoading: isCollectionLoading } = useQuery({
    queryKey: ['collection', id],
    queryFn: async () => {
      const response = await api.get(`/collections/${id}`);
      return response.data;
    }
  });

  // Fetch All Documents (for the Add Documents modal)
  const { data: allDocuments, isLoading: isAllDocsLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await api.get('/documents');
      return response.data;
    }
  });

  // Mutation to add document to collection
  const addDocMutation = useMutation({
    mutationFn: async (documentId) => {
      const response = await api.post(`/collections/${id}/documents`, { documentId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['collection', id]);
      queryClient.invalidateQueries(['collections']); // Update sidebar/counts
    },
    onError: (err) => {
      console.error(err);
      showToast('Failed to add document to collection.', 'error');
    }
  });

  // Filter out documents already in the collection
  const availableDocuments = React.useMemo(() => {
    if (!allDocuments || !collection?.documents) return [];
    
    // Create a set of IDs already in the collection for O(1) lookup
    const collectionDocIds = new Set(collection.documents.map(doc => doc.id));
    
    let available = allDocuments.filter(doc => !collectionDocIds.has(doc.id));
    
    if (searchQuery) {
      available = available.filter(doc => doc.filename.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    return available;
  }, [allDocuments, collection?.documents, searchQuery]);

  // Handle removing document from collection (using the delete action on DocumentCard)
  // Or we could implement a separate "Remove from Collection" mutation. For now we will just use delete which deletes globally,
  // WAIT, the delete button on DocumentCard deletes the document ENTIRELY. 
  // Let's create a mutation to specifically REMOVE from collection instead of deleting from db.
  const removeDocMutation = useMutation({
    mutationFn: async (documentId) => {
      const response = await api.delete(`/collections/${id}/documents/${documentId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['collection', id]);
      queryClient.invalidateQueries(['collections']);
    },
    onError: (err) => {
      console.error(err);
      showToast('Failed to remove document from collection.', 'error');
    }
  });

  const handleRemoveFromCollection = async (documentId, e) => {
    e.stopPropagation();
    const isConfirmed = await confirm({
      title: "Remove Document",
      message: "Remove this document from the collection? (It will not be deleted from your workspace)",
      isDanger: true,
      confirmText: "Remove"
    });
    
    if (isConfirmed) {
      removeDocMutation.mutate(documentId);
    }
  };


  if (isCollectionLoading) {
    return (
      <div className="flex h-screen bg-[#0b0c10] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="flex h-screen bg-[#0b0c10]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Collection not found.
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] bg-[#0b0c10] overflow-hidden font-sans text-white">
      <Sidebar />
      
      <div className="flex-1 flex flex-col relative bg-[#0d0e12]">
        
        {/* Top Header */}
        <header className="h-[72px] shrink-0 border-b border-white/5 flex items-center px-4 pl-14 md:px-8 justify-between bg-[#0b0c10]/80 backdrop-blur-md relative z-10">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-white tracking-tight">Doc-Chat</h1>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
              <span className="hover:text-gray-200 cursor-pointer transition-colors">Analysis</span>
              <span className="hover:text-gray-200 cursor-pointer transition-colors">Metadata</span>
              <span className="hover:text-gray-200 cursor-pointer transition-colors">Export</span>
            </nav>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4 text-sm font-medium text-gray-400">
            <button className="hidden sm:block hover:text-gray-200 transition-colors"><Bell size={18} /></button>
            <button className="hidden sm:block hover:text-gray-200 transition-colors"><History size={18} /></button>
            <button className="hidden sm:flex items-center gap-2 hover:text-gray-200 transition-colors ml-2">
              Share <Share size={14} />
            </button>
            <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden sm:ml-2 cursor-pointer bg-gray-800 shrink-0">
              <div className="w-full h-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold">
                U
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
          <div className="w-full">
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0 mb-6 md:mb-8">
              <div>
                <button 
                  onClick={() => navigate('/collections')}
                  className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium mb-4"
                >
                  <ArrowLeft size={16} /> Back to Collections
                </button>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">{collection.name}</h1>
                <p className="text-gray-400 text-sm max-w-2xl">{collection.description || 'No description provided.'}</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-medium text-white transition-colors shadow-lg shadow-indigo-500/20 w-full sm:w-auto"
              >
                <FolderPlus size={16} />
                Add Documents
              </button>
            </div>

            {/* Document Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {collection.documents?.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500 bg-[#15161d] rounded-2xl border border-white/5">
                  <FileText size={48} className="mb-4 opacity-50" />
                  <p>This collection is empty.</p>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium"
                  >
                    Add your first document
                  </button>
                </div>
              ) : (
                collection.documents?.map((doc) => (
                  <DocumentCard 
                    key={doc.id}
                    doc={doc}
                    onClick={() => {
                      if (doc.status === 'ready') {
                        navigate('/dashboard', { state: { activeDocumentId: doc.id } });
                      }
                    }}
                    onRename={() => {}} // Could implement rename here if desired
                    onDelete={(e) => handleRemoveFromCollection(doc.id, e)} // Override delete to just remove from collection
                  />
                ))
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Add Documents Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121319] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#15161d] shrink-0">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Add Documents</h2>
                <p className="text-xs text-gray-400 mt-1">Select documents from your workspace to add to this collection.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 border-b border-white/5 bg-[#121319] shrink-0">
              <div className="relative w-full">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search available documents..." 
                  className="w-full bg-[#181a22] border border-white/5 text-sm text-gray-200 placeholder-gray-500 rounded-xl py-2 pl-9 pr-4 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {isAllDocsLoading ? (
                <div className="flex justify-center py-8 text-indigo-400">
                  <Loader2 className="animate-spin" size={24} />
                </div>
              ) : availableDocuments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText size={32} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No available documents found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableDocuments.map(doc => (
                    <button
                      key={doc.id}
                      onClick={() => addDocMutation.mutate(doc.id)}
                      disabled={addDocMutation.isPending && addDocMutation.variables === doc.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#181a22] hover:bg-[#1f212a] border border-white/5 hover:border-indigo-500/30 transition-all text-left group disabled:opacity-50"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#121319] border border-white/5 flex items-center justify-center shrink-0">
                        {doc.status === 'ready' ? (
                          <FileText size={16} className="text-gray-400 group-hover:text-indigo-400 transition-colors" />
                        ) : (
                          <Loader2 size={16} className="text-orange-500 animate-spin" />
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="text-[13px] font-medium text-gray-200 truncate" title={doc.preferred_name || doc.filename}>
                          {doc.preferred_name || doc.filename}
                        </h4>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">{doc.status}</p>
                      </div>
                      {addDocMutation.isPending && addDocMutation.variables === doc.id && (
                        <Loader2 size={14} className="text-indigo-400 animate-spin shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-white/5 bg-[#15161d] shrink-0 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionDetails;
