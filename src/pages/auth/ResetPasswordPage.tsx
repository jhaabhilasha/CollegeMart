import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ResetPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await axios.post('/api/auth/request-reset', { email });
      setMessage('OTP sent to your email.');
      setStep(2);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to send OTP');
      }
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await axios.post('/api/auth/verify-reset', { email, otp, newPassword });
      setMessage('Password reset successful! You can now log in.');
      setStep(3);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to reset password');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 px-2 sm:px-0">
      <div className="rounded-2xl bg-white shadow-xl p-8 sm:p-10 w-full max-w-md mx-auto animate-fade-in animate-slide-up">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 sm:mb-6 flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#ef6c13] to-[#f3701a] text-white font-bold shadow hover:from-[#e65c00] hover:to-[#f3701a]"
        >
          &#8592; Back
        </button>
        <div className="text-center">
          <div className="flex justify-center mb-4 sm:mb-6">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="#D35400" />
              <text x="50%" y="56%" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold" fontFamily="Arial, sans-serif" dy=".3em">
                CC
              </text>
            </svg>
          </div>
          <h2 className="mb-4 sm:mb-6 text-3xl sm:text-4xl font-bold text-gray-900">Reset Password</h2>
          <p className="mb-4 sm:mb-6 text-gray-600 text-sm sm:text-base">Enter your email to receive an OTP and reset your password.</p>
        </div>
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
              <input
                id="email"
                type="email"
                className="block w-full rounded-md bg-white text-gray-900 font-semibold shadow-sm border border-gray-300 focus:border-orange-700 focus:ring-orange-700 px-4 py-3 placeholder-gray-400"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="w-full bg-orange-600 text-white font-bold rounded-2xl py-3 mt-2">Send OTP</button>
            {error && <div className="text-red-600 text-center mt-2 text-sm">{error}</div>}
            {message && <div className="text-green-600 text-center mt-2 text-sm">{message}</div>}
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">OTP <span className="text-red-500">*</span></label>
              <input
                id="otp"
                type="text"
                className="block w-full rounded-md bg-white text-gray-900 font-semibold shadow-sm border border-gray-300 focus:border-orange-700 focus:ring-orange-700 px-4 py-3 placeholder-gray-400"
                placeholder="Enter OTP"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password <span className="text-red-500">*</span></label>
              <input
                id="newPassword"
                type="password"
                className="block w-full rounded-md bg-white text-gray-900 font-semibold shadow-sm border border-gray-300 focus:border-orange-700 focus:ring-orange-700 px-4 py-3 placeholder-gray-400"
                placeholder="Enter new password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="w-full bg-green-600 text-white font-bold rounded-2xl py-3 mt-2">Reset Password</button>
            {error && <div className="text-red-600 text-center mt-2 text-sm">{error}</div>}
            {message && <div className="text-green-600 text-center mt-2 text-sm">{message}</div>}
          </form>
        )}
        {step === 3 && (
          <div>
            <div className="text-green-600 mb-4 text-center text-sm sm:text-base">{message}</div>
            <button onClick={() => navigate('/login')} className="text-blue-600 underline text-sm sm:text-base">Go to Login</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
