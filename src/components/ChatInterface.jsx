import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, AlertCircle, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { api } from '../lib/api';

const ChatInterface = ({ document, onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I have read this document. What would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef(null);
  
  // Ref to automatically scroll to the bottom of the chat
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset chat when the user selects a different document
  useEffect(() => {
    setMessages([{ role: 'ai', content: 'Hello! I have read this document. What would you like to know?' }]);
  }, [document?.id]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userQuestion = input.trim();
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
    }
    
    // Add user message to UI immediately
    setMessages(prev => [...prev, { role: 'user', content: userQuestion }]);
    setIsLoading(true);

    try {
      // Hit our new backend route
      const response = await api.post('/chat', {
        documentId: document.id,
        question: userQuestion
      });

      // Add AI response to UI
      setMessages(prev => [...prev, { role: 'ai', content: response.data.answer }]);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to get an answer. Please try again.';
      setMessages(prev => [...prev, { role: 'error', content: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px'; // Max height 150px
  };

  if (!document) return null;

  return (
    <div className="flex flex-col h-full w-full bg-white/5 rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative backdrop-blur-xl">
      {/* Header */}
      <div className="bg-indigo-900/30 border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3 overflow-hidden pr-4">
          <div className="bg-indigo-500 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <Bot size={20} />
          </div>
          <div className="truncate flex flex-col">
            <h2 className="font-bold text-white text-lg leading-tight truncate" title={document.preferred_name || document.filename}>
              {document.preferred_name || document.filename}
            </h2>
            {document.preferred_name && (
              <p className="text-xs text-indigo-300/70 truncate" title={document.filename}>Original: {document.filename}</p>
            )}
            {!document.preferred_name && (
              <p className="text-xs text-indigo-300 truncate">Document AI</p>
            )}
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all shrink-0"
          title="Close Chat"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
              msg.role === 'user' ? 'bg-indigo-500 text-white' : 
              msg.role === 'error' ? 'bg-red-500/20 text-red-400' :
              'bg-white/10 text-indigo-300 border border-white/10'
            }`}>
              {msg.role === 'user' ? <User size={16} /> : 
               msg.role === 'error' ? <AlertCircle size={16} /> : <Bot size={16} />}
            </div>

            {/* Bubble */}
            <div className={`px-5 py-3 rounded-2xl shadow-sm leading-relaxed text-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-500 text-white rounded-tr-sm whitespace-pre-wrap' 
                : msg.role === 'error'
                ? 'bg-red-500/10 text-red-200 border border-red-500/20 rounded-tl-sm'
                : 'bg-white/5 text-slate-200 border border-white/10 rounded-tl-sm markdown-body prose prose-invert prose-sm max-w-none'
            }`}>
              {msg.role === 'user' || msg.role === 'error' ? (
                msg.content
              ) : (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-4 max-w-[85%]">
            <div className="shrink-0 h-8 w-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-indigo-300">
              <Bot size={16} />
            </div>
            <div className="px-5 py-4 rounded-2xl bg-white/5 border border-white/10 rounded-tl-sm flex items-center gap-2">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black/20 border-t border-white/5">
        <form 
          onSubmit={handleSubmit}
          className="relative flex items-end"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Ask a question about the document... (Shift+Enter for new line)"
            className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-2xl pl-5 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed resize-none custom-scrollbar min-h-[54px]"
            rows={1}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 bottom-2 p-2 bg-indigo-500 hover:bg-indigo-400 disabled:bg-white/5 disabled:text-white/30 text-white rounded-xl transition-all shadow-md flex items-center justify-center h-10 w-10"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-1" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
