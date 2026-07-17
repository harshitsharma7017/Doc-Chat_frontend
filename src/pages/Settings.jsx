import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Mail, Contact, Bell, MoreVertical, Share, Download, Loader2, X, Lock, Eye, EyeOff } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { api } from '../lib/api';
import { useToast } from '../contexts/ToastContext';

const PREDEFINED_AVATARS = [
  "https://api.dicebear.com/7.x/bottts/svg?seed=Gamer&backgroundColor=transparent",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Cyber&backgroundColor=transparent",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Mecha&backgroundColor=transparent",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Droid&backgroundColor=transparent",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Hero&backgroundColor=transparent",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Mage&backgroundColor=transparent",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Ninja&backgroundColor=transparent",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Rogue&backgroundColor=transparent",
  "https://api.dicebear.com/7.x/icons/svg?seed=Sword&backgroundColor=transparent",
  "https://api.dicebear.com/7.x/icons/svg?seed=Star&backgroundColor=transparent",
  "https://api.dicebear.com/7.x/icons/svg?seed=Diamond&backgroundColor=transparent",
  "https://api.dicebear.com/7.x/icons/svg?seed=Fire&backgroundColor=transparent",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Happy&backgroundColor=transparent",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Cool&backgroundColor=transparent",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Wink&backgroundColor=transparent",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Sleepy&backgroundColor=transparent"
];

const Settings = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    avatar_url: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const res = await api.get('/users/me');
      return res.data;
    }
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile]);

  const mutation = useMutation({
    mutationFn: async (updatedData) => {
      const res = await api.put('/users/me', updatedData);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['userProfile'], data);
      showToast('Profile updated successfully!', 'success');
    },
    onError: (err) => {
      console.error(err);
      showToast('Failed to update profile. Please try again.', 'error');
    }
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    mutation.mutate(formData);
  };

  const passwordMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.put('/users/me/password', data);
      return res.data;
    },
    onSuccess: () => {
      showToast('Password updated successfully!', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (err) => {
      console.error(err);
      showToast(err.response?.data?.error || 'Failed to update password. Please try again.', 'error');
    }
  });

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordSave = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return showToast("New passwords do not match.", 'error');
    }
    passwordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
  };

  const handleChangeAvatar = () => {
    setIsAvatarModalOpen(true);
  };

  const handleSelectAvatar = (url) => {
    setFormData({ ...formData, avatar_url: url });
    setIsAvatarModalOpen(false);
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  };

  return (
    <div className="flex h-screen bg-[#0b0c10] overflow-hidden font-sans text-white">
      <Sidebar />
      
      <div className="flex-1 flex flex-col relative bg-gradient-to-br from-[#0b0c10] via-[#11131a] to-[#0b0c10]">
        
        {/* Top Header matching mockup */}
        <header className="h-[72px] shrink-0 border-b border-white/5 flex items-center px-8 justify-between bg-[#0b0c10]/80 backdrop-blur-md relative z-10">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-white tracking-tight">Doc-Chat AI</h1>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
              <span className="text-gray-200 cursor-pointer">Documents</span>
              <span className="hover:text-gray-200 cursor-pointer transition-colors">Analysis</span>
              <span className="hover:text-gray-200 cursor-pointer transition-colors">History</span>
            </nav>
          </div>
          
          <div className="flex items-center gap-4 text-sm font-medium text-gray-400">
            <span className="hover:text-gray-200 cursor-pointer transition-colors hidden sm:block">Share</span>
            <span className="hover:text-gray-200 cursor-pointer transition-colors hidden sm:block">Export</span>
            <div className="w-px h-4 bg-white/10 hidden sm:block mx-1"></div>
            <button className="hover:text-gray-200 transition-colors"><Bell size={18} /></button>
            <button className="hover:text-gray-200 transition-colors"><MoreVertical size={18} /></button>
            <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden ml-2 cursor-pointer bg-gray-800 shrink-0">
              {formData.avatar_url ? (
                <img src={formData.avatar_url} alt="User" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold">
                  {formData.name.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="w-full">
            
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Settings</h1>
              <p className="text-gray-400 text-sm">Manage your account, preferences, and workspace configuration.</p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
              </div>
            ) : (
              <div className="bg-[#1a1b23] border border-white/5 rounded-2xl p-8 shadow-2xl">
                
                <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
                  <User className="text-gray-400" size={20} />
                  <h2 className="text-lg font-semibold text-gray-200">Profile Settings</h2>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 rounded-full border border-white/10 overflow-hidden bg-gray-800 shrink-0 relative group flex items-center justify-center">
                      {formData.avatar_url ? (
                        <img src={formData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-3xl">
                          {formData.name.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={handleChangeAvatar}
                      className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Change Avatar
                    </button>
                  </div>

                  {/* Form Section */}
                  <div className="flex-1 space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1 space-y-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
                        <div className="relative">
                          <Contact className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                          <input 
                            type="text" 
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-[#121319] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-600"
                            placeholder="Your Name"
                          />
                        </div>
                      </div>

                      <div className="flex-1 space-y-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                          <input 
                            type="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-[#121319] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-600"
                            placeholder="you@example.com"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bio / Role</label>
                      <textarea 
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={4}
                        className="w-full bg-[#121319] border border-white/10 rounded-xl p-4 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none placeholder:text-gray-600 custom-scrollbar"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                      <button 
                        onClick={handleCancel}
                        className="px-5 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSave}
                        disabled={mutation.isPending}
                        className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-2"
                      >
                        {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
                        Save Changes
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {!isLoading && (
              <div className="bg-[#1a1b23] border border-white/5 rounded-2xl p-8 shadow-2xl mt-8">
                <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
                  <Lock className="text-gray-400" size={20} />
                  <h2 className="text-lg font-semibold text-gray-200">Security Settings</h2>
                </div>

                <div className="flex-1 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Current Password</label>
                    <div className="relative">
                      <input 
                        type={showPasswords.current ? "text" : "password"} 
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full bg-[#121319] border border-white/10 rounded-xl py-2.5 px-4 pr-10 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-600"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-2">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">New Password</label>
                      <div className="relative">
                        <input 
                          type={showPasswords.new ? "text" : "password"} 
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full bg-[#121319] border border-white/10 rounded-xl py-2.5 px-4 pr-10 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-600"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Confirm New Password</label>
                      <div className="relative">
                        <input 
                          type={showPasswords.confirm ? "text" : "password"} 
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full bg-[#121319] border border-white/10 rounded-xl py-2.5 px-4 pr-10 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-600"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-white/5">
                    <button 
                      onClick={handlePasswordSave}
                      disabled={passwordMutation.isPending || !passwordData.currentPassword || !passwordData.newPassword}
                      className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-2"
                    >
                      {passwordMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Avatar Selection Modal */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsAvatarModalOpen(false)}
          ></div>
          <div className="bg-[#181a22] border border-white/10 rounded-2xl p-6 w-full max-w-lg relative z-10 shadow-2xl flex flex-col">
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Choose Avatar
              </h2>
              <button 
                onClick={() => setIsAvatarModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-4">
              {PREDEFINED_AVATARS.map((url, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleSelectAvatar(url)}
                  className={`cursor-pointer rounded-full border-2 overflow-hidden transition-all hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/20 aspect-square flex items-center justify-center bg-gray-800 ${
                    formData.avatar_url === url ? 'border-indigo-500 scale-105 shadow-lg shadow-indigo-500/20' : 'border-transparent'
                  }`}
                >
                  <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            
            <div className="text-center mt-2">
              <p className="text-xs text-gray-500">Or use a custom URL by modifying the image above.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
