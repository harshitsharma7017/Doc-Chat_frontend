import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

const Register = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // OTP States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);

    try {
      // 1. Register the user. This will send the OTP email.
      await api.post('/auth/register', { name, email, password });
      
      // 2. Open OTP Modal instead of logging in
      showToast('Account created! Please check your email for the verification code.', 'success');
      setShowOtpModal(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError('');
    setOtpLoading(true);

    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      localStorage.setItem('token', response.data.token);
      showToast('Email verified successfully!', 'success');
      navigate('/dashboard');
    } catch (err) {
      setOtpError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpError('');
    try {
      await api.post('/auth/resend-otp', { email });
      showToast('Verification code resent! Please check your email.', 'info');
    } catch (err) {
      setOtpError(err.response?.data?.error || 'Failed to resend OTP');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] py-10 relative">
      <div className="glass-panel p-8 rounded-2xl w-full max-w-md hover-lift">
        <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
          Create Account
        </h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Full Name</label>
            <input 
              type="text" 
              required
              className="premium-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              disabled={loading || showOtpModal}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Email</label>
            <input 
              type="email" 
              required
              className="premium-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading || showOtpModal}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                className="premium-input pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                disabled={loading || showOtpModal}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                disabled={loading || showOtpModal}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Confirm Password</label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                required
                className="premium-input pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                disabled={loading || showOtpModal}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                disabled={loading || showOtpModal}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading || showOtpModal}
            className="premium-button w-full mt-6"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
          Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">Sign in</Link>
        </p>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel p-8 rounded-2xl w-full max-w-sm animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold mb-2 text-center text-white">Verify Email</h3>
            <p className="text-[var(--color-text-muted)] text-sm text-center mb-6">
              We've sent a 6-digit verification code to <span className="font-semibold text-white">{email}</span>.
            </p>

            {otpError && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg mb-4 text-sm text-center">
                {otpError}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <input 
                  type="text" 
                  required
                  className="premium-input text-center text-2xl tracking-[0.5em] font-mono"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="••••••"
                  maxLength={6}
                  autoFocus
                />
              </div>

              <button 
                type="submit" 
                disabled={otpLoading || otp.length !== 6}
                className="premium-button w-full flex justify-center items-center gap-2"
              >
                {otpLoading ? <Loader2 size={18} className="animate-spin" /> : 'Verify & Continue'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button 
                onClick={handleResendOtp}
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Didn't receive the code? Resend
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
