import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }).optional(),
  mobile: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{10,}$/.test(val), {
      message: 'Mobile number must be at least 10 digits and contain only numbers',
    }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  rememberMe: z.boolean().optional(),
}).refine((data) => data.email || data.mobile, {
  message: 'Please enter either email or mobile number',
  path: ['email'],
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginMethod, setLoginMethod] = useState<'email' | 'mobile'>('email');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [otpMode, setOtpMode] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Get the return URL from location state or default to home
  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
      mobile: '',
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    setAuthError(null);
    try {
      if (loginMethod === 'email') {
        await login(data.email || '', data.password, '');
      } else {
        await login('', data.password, data.mobile || '');
      }
      navigate(from, { replace: true });
    } catch (error) {
      setAuthError('Login failed. Please check your credentials.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSent(false);
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to send reset link');
      }
      setForgotSent(true);
    } catch (err) {
      setForgotSent(false);
      setAuthError(err instanceof Error ? err.message : 'Failed to send reset link. Please try again.');
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError('');
    try {
      // Generate a random 6-digit OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, otp: generatedOtp })
      });
      if (!res.ok) throw new Error('Failed to send OTP');
      setOtpSent(true);
      setOtpLoading(false);
      otpInputRef.current?.focus();
      // Store OTP in state for demo (in production, verify on backend)
      window.sessionStorage.setItem('otp', generatedOtp);
    } catch (err) {
      setOtpError('Failed to send OTP. Please try again.');
      setOtpLoading(false);
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    setOtpLoading(true);
    // In production, verify OTP on backend
    setTimeout(() => {
      const realOtp = window.sessionStorage.getItem('otp');
      if (otp === realOtp) {
        navigate(from, { replace: true });
      } else {
        setOtpError('Invalid OTP. Try again.');
      }
      setOtpLoading(false);
    }, 1000);
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
          <div className="mb-2 sm:mb-4 rounded-md bg-red-50 p-2 sm:p-4">
            <div className="text-xs sm:text-sm text-red-700">{authError}</div>
          </div>
        )}

        {/* OTP Login Section */}
        {otpMode ? (
          <form className="space-y-6" onSubmit={otpSent ? handleOtpLogin : handleSendOtp}>
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                className="mt-0 block w-full rounded-md bg-white text-gray-900 font-semibold shadow-sm border border-gray-300 focus:border-orange-700 focus:ring-orange-700 hover:border-orange-500 transition-all duration-200 sm:text-base px-4 py-3 placeholder-gray-400"
                placeholder="Email Address"
                value={otpEmail}
                onChange={e => setOtpEmail(e.target.value)}
                disabled={otpSent}
              />
            </div>
            {otpSent && (
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter OTP
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
                className="w-full text-lg font-bold rounded-2xl py-3 mt-6"
                isLoading={otpLoading}
              >
                {otpSent ? 'Login with OTP' : 'Send OTP'}
              </Button>
            </div>
            <div className="text-center mt-2">
              <button type="button" className="text-orange-700 hover:underline text-sm" onClick={() => { setOtpMode(false); setOtpSent(false); setOtp(''); setOtpEmail(''); }}>
                Back to Password Login
              </button>
            </div>
          </form>
        ) : (
        // Password Login Form
        <form className="space-y-6" onSubmit={handleSubmit(onLoginSubmit)}>
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className={`mt-0 block w-full rounded-md bg-white text-gray-900 font-semibold shadow-sm border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:border-orange-700 focus:ring-orange-700 hover:border-orange-500 transition-all duration-200 sm:text-base px-4 py-3 placeholder-gray-400`}
              placeholder="Email Address"
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
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
                  onClick={() => setShowForgot(true)}
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
              placeholder="Password"
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
            <button type="button" className="text-orange-700 hover:underline text-sm" onClick={() => setOtpMode(true)}>
              Login with OTP
            </button>
          </div>
        </form>
        )}

        {/* Forgot Password Modal */}
        {showForgot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm relative animate-fade-in">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowForgot(false)}>&times;</button>
              <h3 className="text-xl font-bold mb-4 text-center">Reset Password</h3>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <input
                  type="email"
                  required
                  className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 font-semibold bg-white focus:border-orange-700 focus:ring-orange-700 placeholder-gray-400"
                  placeholder="Enter your email address"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                />
                <Button type="submit" variant="primary" className="w-full font-bold rounded-2xl py-3" isLoading={false}>
                  Send Reset Link
                </Button>
                {forgotSent && <p className="text-green-600 text-center">Reset link sent! Check your email.</p>}
                {authError && <p className="text-red-600 text-center">{authError}</p>}
              </form>
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Don't have an account yet?{' '}
            <Link
              to="/signup"
              className="font-medium text-primary text-orange-700 hover:underline hover:text-orange-900 transition"
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
