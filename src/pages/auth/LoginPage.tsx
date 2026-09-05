import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn, KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';

const loginSchema = z.object({
  identifier: z.string().min(3, { message: 'Please enter your email or 10-digit mobile number' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithOtp, isLoading, token } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  // OTP Login Mode (direct login via OTP)
  const [otpMode, setOtpMode] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Forgot Password / Reset State
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  // Password matching helpers for Forgot Password
  const hasTypedConfirm = forgotConfirmPassword.length > 0;
  const passwordsMatch = hasTypedConfirm && forgotNewPassword && forgotNewPassword === forgotConfirmPassword;
  const passwordsMismatch = hasTypedConfirm && forgotNewPassword !== forgotConfirmPassword;

  // Get the return URL from location state or default to dashboard/home
  const from = location.state?.from?.pathname || '/dashboard';

  // If already authenticated, redirect to destination
  useEffect(() => {
    if (token) {
      navigate(from, { replace: true });
    }
  }, [token, navigate, from]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
      rememberMe: false,
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    setAuthError(null);
    try {
      const isEmail = data.identifier.includes('@');
      if (isEmail) {
        await login(data.identifier.trim(), data.password, '', data.rememberMe);
      } else {
        const sanitizedMobile = data.identifier.trim().replace(/\D/g, '');
        await login('', data.password, sanitizedMobile, data.rememberMe);
      }
      navigate(from, { replace: true });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Login failed. Please check your credentials.';
      setAuthError(errorMsg);
    }
  };

  // Step 1: Send OTP for Password Reset
  const handleRequestForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send reset OTP');
      }
      setForgotStep(2);
      setForgotSuccess('A 6-digit OTP has been sent to your email.');
    } catch (err) {
      setForgotError(err instanceof Error ? err.message : 'Failed to send reset OTP. Please check the email and try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2: Verify OTP and Set New Password
  const handleVerifyForgotOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (forgotOtp.trim().length !== 6) {
      setForgotError('Please enter a valid 6-digit OTP code.');
      return;
    }

    if (forgotNewPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }

    // Explicit check: Give notice if passwords are not the same
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Notice: New password and confirm password are not the same. Please make sure both passwords match exactly.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/verify-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          otp: forgotOtp.trim(),
          newPassword: forgotNewPassword,
          confirmPassword: forgotConfirmPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Invalid or expired OTP');
      }

      setForgotStep(3);
      setForgotSuccess('Password reset successfully! You can now log in with your new password.');
      setValue('identifier', forgotEmail.trim());

      // Automatically switch back to login form after 2.5 seconds
      setTimeout(() => {
        resetForgotModal();
      }, 2500);
    } catch (err) {
      setForgotError(err instanceof Error ? err.message : 'Password reset failed. Please check your OTP.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }
      setOtpSent(true);
      setOtpLoading(false);
      otpInputRef.current?.focus();
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : 'Failed to send OTP. Please try again.');
      setOtpLoading(false);
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    setOtpLoading(true);
    try {
      await loginWithOtp(otpEmail.trim(), otp.trim());
      setOtpLoading(false);
      navigate(from, { replace: true });
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : 'Invalid OTP. Please try again.');
      setOtpLoading(false);
    }
  };

  const resetForgotModal = () => {
    setShowForgot(false);
    setForgotStep(1);
    setForgotError('');
    setForgotSuccess('');
    setForgotOtp('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setShowForgotNewPassword(false);
    setShowForgotConfirmPassword(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 px-2 sm:px-0">
      <div className="rounded-2xl bg-white shadow-xl p-8 sm:p-10 w-full max-w-md mx-auto animate-fade-in animate-slide-up">
        {window.history.length > 1 && (
          <button
            onClick={() => navigate(-1)}
            className="mb-4 sm:mb-6 flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#ef6c13] to-[#f3701a] text-white font-bold shadow hover:from-[#e65c00] hover:to-[#f3701a]"
          >
            &#8592; Back
          </button>
        )}
        <div className="text-center">
          <div className="flex justify-center mb-4 sm:mb-6">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="#D35400" />
              <text x="50%" y="56%" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold" fontFamily="Arial, sans-serif" dy=".3em">
                CC
              </text>
            </svg>
          </div>
          
          <h2 className="mb-6 text-center text-3xl font-bold text-gray-900">
            Welcome Back
          </h2>
          <p className="mb-4 sm:mb-6 text-gray-600 text-sm sm:text-base">
            Sign in to access your account and continue buying and selling on campus.
          </p>
        </div>

        {authError && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4">
            <div className="text-sm font-medium text-red-700">{authError}</div>
          </div>
        )}

        {/* OTP Login Section */}
        {otpMode ? (
          <form className="space-y-6" onSubmit={otpSent ? handleOtpLogin : handleSendOtp}>
            <div>
              <label htmlFor="otpEmail" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Registered Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="otpEmail"
                type="email"
                required
                className="mt-0 block w-full rounded-md bg-white text-gray-900 font-semibold shadow-sm border border-gray-300 focus:border-orange-700 focus:ring-orange-700 hover:border-orange-500 transition-all duration-200 sm:text-base px-4 py-3 placeholder-gray-400"
                placeholder="you@college.edu"
                value={otpEmail}
                onChange={e => setOtpEmail(e.target.value)}
                disabled={otpSent}
              />
            </div>
            {otpSent && (
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter 6-Digit OTP <span className="text-red-500">*</span>
                </label>
                <input
                  id="otp"
                  type="text"
                  maxLength={6}
                  ref={otpInputRef}
                  className="mt-0 block w-full rounded-md bg-white text-gray-900 font-semibold shadow-sm border border-gray-300 focus:border-orange-700 focus:ring-orange-700 hover:border-orange-500 transition-all duration-200 sm:text-base px-4 py-3 placeholder-gray-400 tracking-widest text-center text-lg"
                  placeholder="123456"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  autoFocus
                />
                {otpError && <p className="mt-1 text-xs text-red-600">{otpError}</p>}
              </div>
            )}
            <div>
              <Button
                type="submit"
                variant="primary"
                className="w-full text-lg font-bold rounded-2xl py-3 mt-4"
                isLoading={otpLoading}
              >
                {otpSent ? 'Login with OTP' : 'Send Login OTP'}
              </Button>
            </div>
            <div className="text-center mt-2">
              <button
                type="button"
                className="text-orange-700 hover:underline text-sm font-medium"
                onClick={() => {
                  setOtpMode(false);
                  setOtpSent(false);
                  setOtp('');
                  setOtpEmail('');
                  setOtpError('');
                }}
              >
                Back to Password Login
              </button>
            </div>
          </form>
        ) : (
          // Password Login Form
          <form className="space-y-6" onSubmit={handleSubmit(onLoginSubmit)}>
            {/* Identifier: Email or Mobile */}
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
                Email or Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                id="identifier"
                type="text"
                autoComplete="username"
                required
                className={`mt-0 block w-full rounded-md bg-white text-gray-900 font-semibold shadow-sm border ${errors.identifier ? 'border-red-500' : 'border-gray-300'} focus:border-orange-700 focus:ring-orange-700 hover:border-orange-500 transition-all duration-200 sm:text-base px-4 py-3 placeholder-gray-400`}
                placeholder="name@college.edu or 10-digit mobile"
                {...register('identifier')}
              />
              {errors.identifier && (
                <p className="mt-1 text-xs text-red-600">{errors.identifier.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="text-sm">
                  <button
                    type="button"
                    className="font-medium text-orange-700 hover:text-orange-800 focus:outline-none"
                    onClick={() => {
                      setShowForgot(true);
                      setForgotStep(1);
                      setForgotError('');
                      setForgotSuccess('');
                    }}
                  >
                    Forgot your password?
                  </button>
                </div>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                className={`mt-0 block w-full rounded-md bg-white text-gray-900 font-semibold shadow-sm border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:border-orange-700 focus:ring-orange-700 hover:border-orange-500 transition-all duration-200 sm:text-base px-4 py-3 placeholder-gray-400`}
                placeholder="Your password"
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-orange-700 focus:ring-orange-700 transition-all duration-200"
                {...register('rememberMe')}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 select-none cursor-pointer">
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <div>
              <Button
                type="submit"
                variant="primary"
                className="w-full text-lg font-bold rounded-2xl py-3 mt-6"
                isLoading={isLoading}
              >
                <LogIn className="mr-2 h-5 w-5" />
                Login
              </Button>
            </div>
            <div className="text-center mt-2">
              <button
                type="button"
                className="text-orange-700 hover:underline text-sm font-medium"
                onClick={() => setOtpMode(true)}
              >
                Login with OTP
              </button>
            </div>
          </form>
        )}

        {/* 2-Step Forgot Password & OTP Reset Modal */}
        {showForgot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md relative animate-fade-in border border-gray-100 max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl p-1 leading-none"
                onClick={resetForgotModal}
                type="button"
              >
                &times;
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-600 mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {forgotStep === 1 ? 'Reset Password' : forgotStep === 2 ? 'Verify OTP & Set Password' : 'Password Reset Complete'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {forgotStep === 1
                    ? 'Enter your registered email address to receive a 6-digit verification OTP.'
                    : forgotStep === 2
                    ? `Enter the 6-digit OTP sent to ${forgotEmail} along with your new password.`
                    : 'Your password has been successfully updated.'}
                </p>
              </div>

              {forgotError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium flex items-start gap-2 animate-fade-in">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotSuccess && forgotStep !== 3 && (
                <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 font-medium">
                  {forgotSuccess}
                </div>
              )}

              {/* STEP 1: Enter Email to Send OTP */}
              {forgotStep === 1 && (
                <form onSubmit={handleRequestForgotOtp} className="space-y-4">
                  <div>
                    <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      autoFocus
                      className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 font-semibold bg-white focus:border-orange-700 focus:ring-orange-700 placeholder-gray-400"
                      placeholder="Enter your registered email"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full font-bold rounded-2xl py-3 text-base"
                    isLoading={forgotLoading}
                  >
                    Send 6-Digit OTP
                  </Button>
                </form>
              )}

              {/* STEP 2: Enter OTP + New Password with Live Match Notice */}
              {forgotStep === 2 && (
                <form onSubmit={handleVerifyForgotOtpAndReset} className="space-y-4">
                  {/* OTP Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="forgot-otp" className="block text-sm font-medium text-gray-700">
                        6-Digit OTP Code <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        className="text-xs text-orange-600 hover:underline font-semibold"
                        onClick={() => {
                          setForgotStep(1);
                          setForgotError('');
                        }}
                      >
                        Change Email
                      </button>
                    </div>
                    <input
                      id="forgot-otp"
                      type="text"
                      maxLength={6}
                      required
                      autoFocus
                      className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 font-bold bg-white focus:border-orange-700 focus:ring-orange-700 text-center tracking-widest text-lg placeholder-gray-400"
                      placeholder="123456"
                      value={forgotOtp}
                      onChange={e => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>

                  {/* New Password */}
                  <div>
                    <label htmlFor="forgot-new-pwd" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="forgot-new-pwd"
                        type={showForgotNewPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        className="block w-full rounded-md border border-gray-300 px-4 py-3 pr-10 text-gray-900 font-semibold bg-white focus:border-orange-700 focus:ring-orange-700 placeholder-gray-400"
                        placeholder="Minimum 6 characters"
                        value={forgotNewPassword}
                        onChange={e => setForgotNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                      >
                        {showForgotNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password with Live Match Notice */}
                  <div>
                    <label htmlFor="forgot-confirm-pwd" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="forgot-confirm-pwd"
                        type={showForgotConfirmPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        className={`block w-full rounded-md border px-4 py-3 pr-10 text-gray-900 font-semibold bg-white transition-colors duration-150 ${
                          passwordsMismatch
                            ? 'border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-red-600'
                            : passwordsMatch
                            ? 'border-green-500 bg-green-50/20 focus:border-green-600 focus:ring-green-600'
                            : 'border-gray-300 focus:border-orange-700 focus:ring-orange-700'
                        } placeholder-gray-400`}
                        placeholder="Re-enter your new password"
                        value={forgotConfirmPassword}
                        onChange={e => setForgotConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                      >
                        {showForgotConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                    {passwordsMatch && forgotNewPassword.length >= 6 && (
                      <div className="mt-2 p-2 rounded-lg bg-green-50 border border-green-200 text-xs font-semibold text-green-700 flex items-center gap-1.5 animate-fade-in">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                        <span>Both passwords match successfully!</span>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full font-bold rounded-2xl py-3 text-base mt-2"
                    isLoading={forgotLoading}
                    disabled={passwordsMismatch}
                  >
                    Verify OTP & Reset Password
                  </Button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      disabled={forgotLoading}
                      onClick={handleRequestForgotOtp}
                      className="text-xs text-gray-600 hover:text-orange-600 underline"
                    >
                      Didn't receive the OTP? Resend
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: Success Screen */}
              {forgotStep === 3 && (
                <div className="text-center py-4 space-y-4">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto animate-bounce" />
                  <p className="text-green-700 font-semibold">{forgotSuccess}</p>
                  <Button
                    type="button"
                    variant="primary"
                    className="w-full font-bold rounded-2xl py-3"
                    onClick={resetForgotModal}
                  >
                    Proceed to Login
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Don't have an account yet?{' '}
            <Link
              to="/signup"
              className="font-medium text-orange-700 hover:underline hover:text-orange-900 transition"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
