import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Database, FileText, Server, Layers, Info, Loader2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { api } from '../lib/api';
import { formatFileSize } from '../lib/utils';

const StorageDetails = () => {
  const navigate = useNavigate();

  const { data: storageDetails, isLoading } = useQuery({
    queryKey: ['storageDetails'],
    queryFn: async () => {
      const response = await api.get('/documents/storage/details');
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

  return (
    <div className="flex h-screen bg-[#0b0c10] overflow-hidden font-sans">
      <Sidebar />
      
      <div className="flex-1 flex flex-col relative bg-gradient-to-br from-[#0b0c10] via-[#11131a] to-[#0b0c10]">
        
        {/* Header */}
        <header className="h-[72px] shrink-0 border-b border-white/5 flex items-center px-8 justify-between relative z-10 bg-[#0b0c10]/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/workspace')}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Database className="text-indigo-500" size={24} />
              Database Storage Breakdown
            </h1>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto h-full flex flex-col">
            
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#181a22] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Database size={48} /></div>
                <h3 className="text-gray-400 text-sm font-medium mb-1">Total DB Usage</h3>
                <div className="text-3xl font-bold text-white mb-2">
                  {storageStats ? formatFileSize(storageStats.usedBytes) : '-- KB'}
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    style={{ width: `${storageStats ? storageStats.percentage : 0}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">of 10 MB limit</p>
              </div>

              <div className="bg-[#181a22] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Layers size={48} /></div>
                <h3 className="text-gray-400 text-sm font-medium mb-1">Text Chunks Space</h3>
                <div className="text-3xl font-bold text-indigo-400">
                  {storageDetails ? formatFileSize(storageDetails.reduce((acc, curr) => acc + parseInt(curr.text_bytes || 0, 10), 0)) : '-- KB'}
                </div>
                <p className="text-xs text-gray-500 mt-2">Extracted raw text content</p>
              </div>

              <div className="bg-[#181a22] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Server size={48} /></div>
                <h3 className="text-gray-400 text-sm font-medium mb-1">Vector Embeddings</h3>
                <div className="text-3xl font-bold text-purple-400">
                  {storageDetails ? formatFileSize(storageDetails.reduce((acc, curr) => acc + parseInt(curr.embedding_bytes || 0, 10), 0)) : '-- KB'}
                </div>
                <p className="text-xs text-gray-500 mt-2">768-dimensional AI arrays</p>
              </div>
            </div>

            {/* Note */}
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mb-8 flex items-start gap-3">
              <Info className="text-indigo-400 shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-indigo-200">
                <span className="font-semibold text-indigo-300">Note:</span> Original file sizes (like PDF weights) do not occupy space in this database quota. Only the extracted text chunks, vector embeddings, and database metadata are counted against your 10 MB limit.
              </p>
            </div>

            {/* Table */}
            <div className="bg-[#181a22] border border-white/5 rounded-2xl overflow-hidden flex-1 flex flex-col">
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm text-gray-400">
                  <thead className="bg-[#121319] border-b border-white/5 text-xs uppercase font-medium">
                    <tr>
                      <th className="px-6 py-4">Document Name</th>
                      <th className="px-6 py-4 text-right">Text Space</th>
                      <th className="px-6 py-4 text-right">Vector Space</th>
                      <th className="px-6 py-4 text-right">Metadata Space</th>
                      <th className="px-6 py-4 text-right font-bold text-gray-200">Total DB Space</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {isLoading ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <Loader2 className="animate-spin mx-auto mb-2 text-indigo-500" size={24} />
                          <p>Loading storage details...</p>
                        </td>
                      </tr>
                    ) : storageDetails && storageDetails.length > 0 ? (
                      storageDetails.map(doc => (
                        <tr key={doc.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <FileText size={16} className="text-indigo-400" />
                              <span className="text-gray-200 font-medium">{doc.filename}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">{formatFileSize(doc.text_bytes)}</td>
                          <td className="px-6 py-4 text-right text-purple-400">{formatFileSize(doc.embedding_bytes)}</td>
                          <td className="px-6 py-4 text-right">{formatFileSize(doc.metadata_bytes)}</td>
                          <td className="px-6 py-4 text-right font-bold text-gray-200 bg-white/[0.02]">
                            {formatFileSize(doc.total_bytes)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                          No documents found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageDetails;
