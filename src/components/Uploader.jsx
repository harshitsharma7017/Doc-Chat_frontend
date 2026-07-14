import React, { useState, useRef } from 'react';
import { UploadCloud, File, Loader2 } from 'lucide-react';
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
      // The Axios interceptor automatically attaches our JWT!
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
    <div className="w-full max-w-xl mx-auto">
      <div 
        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
          isDragging 
            ? 'border-indigo-400 bg-indigo-500/10' 
            : 'border-white/10 hover:border-white/20 bg-black/20'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!file ? (
          <div className="space-y-4 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <UploadCloud size={40} className="text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold">Upload a Document</h2>
            <p className="text-[var(--color-text-muted)] text-sm px-8">
              Drag and drop your PDF, DOCX, or TXT files here to start chatting with them. Max 10MB.
            </p>
            <button className="premium-button mt-4">
              Browse Files
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl text-left border border-white/10">
              <div className="bg-indigo-500/20 p-3 rounded-lg">
                <File className="text-indigo-400" size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{file.name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">
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
              className="premium-button w-full flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Uploading to S3...
                </>
              ) : (
                'Upload Document'
              )}
            </button>
          </div>
        )}

        {/* Hidden file input triggered by clicking the dropzone */}
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
