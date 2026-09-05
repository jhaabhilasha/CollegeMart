import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

const ResetPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Real-time password matching helpers
  const hasTypedConfirm = confirmPassword.length > 0;
  const passwordsMatch = hasTypedConfirm && newPassword && newPassword === confirmPassword;
  const passwordsMismatch = hasTypedConfirm && newPassword !== confirmPassword;

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/request-reset', { email: email.trim() });
      setMessage(res.data.message || 'OTP sent to your email.');
      setStep(2);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to send OTP. Please check your email and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (otp.trim().length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Notice: New password and confirm password are not the same. Please make sure both passwords are identical.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/auth/verify-reset', {
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
        confirmPassword
      });
      setMessage('Password reset successful! You can now log in.');
      setStep(3);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to reset password. Please check your OTP.');
      }
    } finally {
      setLoading(false);
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
          <h2 className="mb-2 sm:mb-4 text-3xl font-bold text-gray-900">Reset Password</h2>
          <p className="mb-6 text-gray-600 text-sm sm:text-base">
            {step === 1 && 'Enter your email to receive a 6-digit OTP.'}
            {step === 2 && `Enter the 6-digit OTP sent to ${email} and set your new password.`}
            {step === 3 && 'Your password has been reset successfully.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {message && step !== 3 && (
          <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 font-medium text-center">
            {message}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                className="block w-full rounded-md bg-white text-gray-900 font-semibold shadow-sm border border-gray-300 focus:border-orange-700 focus:ring-orange-700 px-4 py-3 placeholder-gray-400"
                placeholder="Enter your registered email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl py-3 mt-2 transition"
            >
              {loading ? 'Sending OTP...' : 'Send 6-Digit OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Enter 6-Digit OTP <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-orange-600 hover:underline font-semibold"
                >
                  Change Email
                </button>
              </div>
              <input
                id="otp"
                type="text"
                maxLength={6}
                className="block w-full rounded-md bg-white text-gray-900 font-bold shadow-sm border border-gray-300 focus:border-orange-700 focus:ring-orange-700 px-4 py-3 placeholder-gray-400 text-center tracking-widest text-lg"
                placeholder="123456"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                required
                autoFocus
              />
            </div>

            {/* New Password with Eye Toggle */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  minLength={6}
                  className="block w-full rounded-md bg-white text-gray-900 font-semibold shadow-sm border border-gray-300 focus:border-orange-700 focus:ring-orange-700 px-4 py-3 pr-10 placeholder-gray-400"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password with Eye Toggle & Live Match Notice */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  minLength={6}
                  className={`block w-full rounded-md bg-white text-gray-900 font-semibold shadow-sm border px-4 py-3 pr-10 transition-colors duration-150 ${
                    passwordsMismatch
                      ? 'border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-red-600'
                      : passwordsMatch
                      ? 'border-green-500 bg-green-50/20 focus:border-green-600 focus:ring-green-600'
                      : 'border-gray-300 focus:border-orange-700 focus:ring-orange-700'
                  } placeholder-gray-400`}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* LIVE NOTICE: When passwords are not the same */}
              {passwordsMismatch && (
                <div className="mt-2 p-2 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-600 flex items-center gap-1.5 animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>Notice: Both passwords are not the same. Please make sure they match.</span>
                </div>
              )}

              {/* LIVE NOTICE: When passwords match */}
              {passwordsMatch && newPassword.length >= 6 && (
                <div className="mt-2 p-2 rounded-lg bg-green-50 border border-green-200 text-xs font-semibold text-green-700 flex items-center gap-1.5 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                  <span>Both passwords match successfully!</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || passwordsMismatch}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-2xl py-3 mt-2 transition"
            >
              {loading ? 'Verifying...' : 'Verify OTP & Reset Password'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleRequestOtp}
                className="text-xs text-gray-600 hover:text-orange-600 underline"
              >
                Didn't receive the OTP? Resend
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto animate-bounce" />
            <div className="text-green-600 font-semibold text-base">{message}</div>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl py-3 transition"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
