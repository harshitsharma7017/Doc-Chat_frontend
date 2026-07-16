import React, { useState, useRef } from 'react';
import { UploadCloud, File, Loader2, FileText, Image as ImageIcon } from 'lucide-react';
import { api } from '../lib/api';

const Uploader = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    
    // Check file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum size is 10MB.');
      return;
    }

    // Check file type
    const validTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Send the file to our backend. 
      const response = await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Reset state on success
      setFile(null);
      if (onUploadSuccess) onUploadSuccess(response.data);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div 
        className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all ${
          isDragging 
            ? 'border-indigo-400 bg-indigo-500/5' 
            : 'border-indigo-500/20 hover:border-indigo-400/40 bg-[#16171c]/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!file ? (
          <div className="space-y-6 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-14 h-14 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4 bg-white/5 hover:bg-white/10 transition-colors">
              <UploadCloud size={24} className="text-white" />
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Drag & drop files here</h2>
              <p className="text-gray-400 text-sm">
                or click to browse from your computer
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 text-xs font-medium text-gray-500 mt-6 pt-4">
              <span className="flex items-center gap-1.5"><FileText size={14} /> PDF</span>
              <span className="flex items-center gap-1.5"><FileText size={14} /> DOCX</span>
              <span className="flex items-center gap-1.5"><FileText size={14} /> TXT</span>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-sm mx-auto">
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl text-left border border-white/10">
              <div className="bg-indigo-500/20 p-3 rounded-lg">
                <File className="text-indigo-400" size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-white truncate">{file.name}</p>
                <p className="text-xs text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              {!uploading && (
                <button 
                  onClick={() => setFile(null)}
                  className="text-red-400 hover:text-red-300 text-xs px-3 py-1 rounded-md hover:bg-red-500/10 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>

            <button 
              onClick={handleUpload}
              disabled={uploading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none transition-colors"
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Processing...
                </>
              ) : (
                'Upload Securely'
              )}
            </button>
          </div>
        )}

        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept=".pdf,.txt,.docx,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
        />
      </div>

      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm text-center animate-pulse">
          {error}
        </div>
      )}
    </div>
  );
};

export default Uploader;
