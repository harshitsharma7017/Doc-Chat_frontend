import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, FileText, MessageSquare } from 'lucide-react';
import Uploader from '../components/Uploader';

const Dashboard = () => {
  const navigate = useNavigate();

  // Basic Auth Check: If no token, kick them back to login
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex h-[calc(100vh-80px)] gap-6 -mt-2">
      {/* Sidebar */}
      <div className="glass-panel w-72 rounded-2xl p-4 flex flex-col">
        <div className="flex items-center gap-3 px-2 py-3 text-indigo-400 font-semibold mb-4 border-b border-white/10">
          <MessageSquare size={20} />
          <h2>Your Documents</h2>
        </div>

        {/* We will map over documents here in M3.3 */}
        <div className="flex-1 overflow-y-auto space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 cursor-pointer hover-lift">
            <FileText size={18} />
            <span className="text-sm truncate">Sample_Document.pdf</span>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="mt-auto flex items-center justify-center gap-2 w-full p-3 rounded-xl hover:bg-white/5 text-[var(--color-text-muted)] transition-colors"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="glass-panel flex-1 rounded-2xl p-8 flex flex-col items-center justify-center">
        <Uploader onUploadSuccess={() => console.log('File uploaded!')} />
      </div>
    </div>
  );
};

export default Dashboard;
