import React from 'react';
import { FileText, Loader2, Edit2, Download, Trash2, MoreVertical, Image as ImageIcon, FolderPlus } from 'lucide-react';
import PdfThumbnail from './PdfThumbnail';
import { formatFileSize } from '../lib/utils';

const DocumentCard = ({ doc, onClick, onRename, onDelete, onAddToCollection }) => {
  // Fix 7: Trim whitespace, collapse multiple spaces, and remove stray spaces before punctuation
  const rawTitle = doc.preferred_name || doc.filename;
  const displayTitle = rawTitle
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?\-])/g, '$1');

  // Fix 8: Badge states explicitly map to backend enums ('processing', 'ready', 'failed')
  // We use solid opaque backgrounds to prevent text overlap issues (Fix 1).
  const renderBadge = () => {
    switch (doc.status) {
      case 'ready':
        return (
          <span className="bg-[#1a1c23] border border-white/5 text-gray-200 text-[10px] font-bold px-2.5 py-1.5 rounded uppercase tracking-wider flex items-center gap-2 shadow-md">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            Ready
          </span>
        );
      case 'processing':
        return (
          <span className="bg-[#1a1c23] border border-white/5 text-gray-200 text-[10px] font-bold px-2.5 py-1.5 rounded uppercase tracking-wider flex items-center gap-2 shadow-md">
            <Loader2 size={10} className="animate-spin text-orange-500" /> Processing
          </span>
        );
      case 'failed':
        return (
          <span className="bg-[#1a1c23] border border-white/5 text-gray-200 text-[10px] font-bold px-2.5 py-1.5 rounded uppercase tracking-wider flex items-center gap-2 shadow-md">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
            Failed
          </span>
        );
      default:
        // Future states can be added here
        return (
          <span className="bg-gray-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-md">
            {doc.status}
          </span>
        );
    }
  };

  const isReady = doc.status === 'ready';
  const isProcessing = doc.status === 'processing';

  // Helper to format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'Today';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div 
      onClick={isReady ? onClick : undefined}
      className={`bg-[#181a22] border border-white/5 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all group ${isReady ? 'cursor-pointer' : 'cursor-default opacity-80'} flex flex-col relative`}
    >
      {/* Card Image Area (Fix 3: 16/9 aspect ratio container) */}
      <div className="w-full aspect-video bg-[#121319] relative overflow-hidden shrink-0 border-b border-white/5">
        
        {/* Fix 1: Badge positioned at absolute top: 12px, left: 12px with solid background */}
        <div className="absolute top-[12px] left-[12px] z-30">
          {renderBadge()}
        </div>

        {/* Fallback image icon if no thumbnail */}
        {!doc.s3_url && (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon size={48} className="text-indigo-500/20" />
          </div>
        )}

        {isReady && doc.s3_url && (
          <div className="absolute inset-0 w-full h-full pointer-events-none opacity-90 mix-blend-screen pdf-thumbnail-container">
             <PdfThumbnail url={doc.s3_url} />
          </div>
        )}
        
        <div className={`absolute inset-0 z-10 pointer-events-none ${isReady ? 'opacity-70 bg-gradient-to-t from-[#181a22] to-transparent' : 'opacity-40 bg-gradient-to-br from-indigo-900/40 to-[#121319]'}`} />

        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="w-12 h-12 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin"></div>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-3 md:p-5 flex flex-col flex-1 bg-[#181a22]">
        
        <div className="flex justify-between items-start mb-2 md:mb-3 min-h-[40px] md:min-h-[48px]">
          {/* Fix 4 & 5: Single line for title, with native title attribute containing full string */}
          <h3 
            className="text-[14px] md:text-[18px] font-bold text-white leading-tight line-clamp-2 pr-2" 
            title={rawTitle}
          >
            {displayTitle}
          </h3>
          <button className="text-gray-500 hover:text-gray-300 mt-0.5 shrink-0 transition-colors">
            <MoreVertical size={18} />
          </button>
        </div>
        
        {/* PDF Label Row */}
        <div>
          {isProcessing ? (
            <span className="flex items-center gap-2 text-gray-500 text-[12px] md:text-[15px] font-semibold tracking-wide">
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-ping ml-0.5"></span>
              Extracting...
            </span>
          ) : (
            <span className="flex items-center gap-2 md:gap-2.5 text-[12px] md:text-[15px] font-semibold text-gray-300 tracking-wide">
              <FileText size={16} className="text-gray-400 -ml-0.5 md:hidden" />
              <FileText size={20} className="text-gray-400 -ml-0.5 hidden md:block" />
              {doc.filename.toLowerCase().endsWith('.pdf') ? 'PDF' : 'DOCX'}
            </span>
          )}
        </div>

        {/* Meta footer */}
        <div className="flex flex-col md:flex-row md:items-center justify-between text-[10px] md:text-[12px] text-gray-500 mt-2 md:mt-4 mb-2 md:mb-4 gap-1 md:gap-0">
          <div className="flex items-center gap-1 md:gap-2">
            <span>{isProcessing ? '--' : (doc.pages || '--')} Pages</span>
            <span>•</span>
            <span>{formatFileSize(doc.file_size)}</span>
          </div>
          <span>{formatDate(doc.created_at)}</span>
        </div>

        {/* Action Buttons Row */}
        {isReady && (
          <div className="flex items-center gap-2 md:gap-4 mt-auto border-t border-white/5 pt-3 md:pt-4">
            {/* Item 1: Add to Collection */}
            {onAddToCollection && (
              <button 
                onClick={(e) => { e.stopPropagation(); onAddToCollection(doc.id); }}
                className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-[#252630] hover:bg-[#323340] flex items-center justify-center text-emerald-400 border border-white/5 transition-colors shadow-sm"
                title="Add to Collection"
              >
                <FolderPlus size={14} strokeWidth={2.5} className="md:w-[14px] md:h-[14px] w-[12px] h-[12px]" />
              </button>
            )}
            
            {/* Item 2: Edit */}
            <button 
              onClick={(e) => { e.stopPropagation(); onRename(e); }}
              className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-[#252630] hover:bg-[#323340] flex items-center justify-center text-indigo-400 border border-white/5 transition-colors shadow-sm"
              title="Rename Document"
            >
              <Edit2 size={14} strokeWidth={2.5} className="md:w-[14px] md:h-[14px] w-[12px] h-[12px]" />
            </button>
            
            {/* Item 3: Download (Disabled state if no URL) */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (doc.s3_url) {
                  window.open(doc.s3_url, '_blank');
                }
              }}
              disabled={!doc.s3_url}
              className={`w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center border border-white/5 transition-colors shadow-sm ${doc.s3_url ? 'bg-[#252630] hover:bg-[#323340] text-blue-400' : 'bg-[#1e1f28] text-gray-600 cursor-not-allowed border-transparent'}`}
              title="Download"
            >
              <Download size={14} strokeWidth={2.5} className="md:w-[14px] md:h-[14px] w-[12px] h-[12px]" />
            </button>
            
            {/* Item 4: Delete */}
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(e); }}
              className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-[#252630] hover:bg-red-950/40 flex items-center justify-center text-red-400 border border-white/5 transition-colors shadow-sm"
              title="Delete Document"
            >
              <Trash2 size={14} strokeWidth={2.5} className="md:w-[14px] md:h-[14px] w-[12px] h-[12px]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;
