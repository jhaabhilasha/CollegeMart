import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import Button from '../../components/ui/Button';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        
        const data = await res.json();
        
        if (res.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed');
        }
      } catch {
        setStatus('error');
        setMessage('An error occurred during verification');
      }
    };

    verifyEmail();
  }, [token]);

  const handleResendVerification = async () => {
    if (!resendEmail) return;
    
    setResendStatus('loading');
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail }),
      });
      
      if (res.ok) {
        setResendStatus('success');
      } else {
        setResendStatus('error');
      }
    } catch {
      setResendStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        {status === 'loading' && (
          <div className="text-center">
            <Loader2 className="mx-auto h-16 w-16 text-orange-500 animate-spin" />
            <h2 className="mt-6 text-2xl font-bold text-gray-900">Verifying your email...</h2>
            <p className="mt-2 text-gray-600">Please wait while we verify your email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-6 text-2xl font-bold text-gray-900">Email Verified!</h2>
            <p className="mt-2 text-gray-600">{message}</p>
            <div className="mt-6">
              <Link to="/login">
                <Button className="w-full">Continue to Login</Button>
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <XCircle className="mx-auto h-16 w-16 text-red-500" />
            <h2 className="mt-6 text-2xl font-bold text-gray-900">Verification Failed</h2>
            <p className="mt-2 text-gray-600">{message}</p>
            <p className="mt-4 text-sm text-gray-500">
              The verification link may have expired or is invalid.
            </p>
            
            <div className="mt-6 space-y-4">
              <p className="text-sm font-medium text-gray-700">Request a new verification email:</p>
              <input
                type="email"
                placeholder="Enter your email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <Button 
                onClick={handleResendVerification} 
                disabled={resendStatus === 'loading' || !resendEmail}
                className="w-full"
              >
                {resendStatus === 'loading' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Resend Verification Email'
                )}
              </Button>
              
              {resendStatus === 'success' && (
                <p className="text-green-600 text-sm">Verification email sent! Check your inbox.</p>
              )}
              {resendStatus === 'error' && (
                <p className="text-red-600 text-sm">Failed to send email. Please try again.</p>
              )}
            </div>
          </div>
        )}

        {status === 'no-token' && (
          <div className="text-center">
            <Mail className="mx-auto h-16 w-16 text-orange-500" />
            <h2 className="mt-6 text-2xl font-bold text-gray-900">Email Verification</h2>
            <p className="mt-2 text-gray-600">
              Please check your email for a verification link, or request a new one below.
            </p>
            
            <div className="mt-6 space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <Button 
                onClick={handleResendVerification} 
                disabled={resendStatus === 'loading' || !resendEmail}
                className="w-full"
              >
                {resendStatus === 'loading' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Send Verification Email'
                )}
              </Button>
              
              {resendStatus === 'success' && (
                <p className="text-green-600 text-sm">Verification email sent! Check your inbox.</p>
              )}
              {resendStatus === 'error' && (
                <p className="text-red-600 text-sm">Failed to send email. Please try again.</p>
              )}
            </div>
            
            <div className="mt-6">
              <Link to="/login" className="text-orange-600 hover:text-orange-700 font-medium">
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
