import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Mail, Lock, ShieldCheck, Heart, Rocket, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../components/common/Toast.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const { login, googleLogin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';
  const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;

  // Initialize Real Google Identity Services (GSI)
  useEffect(() => {
    if (!googleClientId) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setGoogleScriptLoaded(true);
      if ((window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: { credential?: string }) => {
            if (!response.credential) return;
            setLoading(true);
            try {
              await googleLogin({ credential: response.credential });
              toast.success('Google Authentication', 'Signed in via verified Google account.');
              navigate(from, { replace: true });
            } catch (err: any) {
              toast.error('Google Sign-In Failed', err.response?.data?.message || 'Verification error.');
            } finally {
              setLoading(false);
            }
          },
        });

        if (googleBtnRef.current) {
          (window as any).google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with',
            shape: 'pill',
          });
        }
      }
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [googleClientId, googleLogin, navigate, from, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Missing Credentials', 'Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome Back!', 'Authentication successful.');
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error('Sign In Failed', err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    if (!googleClientId) {
      toast.error(
        'Google Client ID Required',
        'VITE_GOOGLE_CLIENT_ID is not configured in your frontend environment variables.'
      );
      return;
    }

    if ((window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.prompt();
    } else {
      toast.error('Google Auth Loading', 'Google Identity SDK is still initializing, please try again.');
    }
  };

  const setDemoCredentials = (role: 'admin' | 'creator' | 'supporter') => {
    if (role === 'admin') {
      setEmail('admin@fundbridge.com');
      setPassword('admin123');
    } else if (role === 'creator') {
      setEmail('creator@fundbridge.com');
      setPassword('creator123');
    } else {
      setEmail('supporter@fundbridge.com');
      setPassword('supporter123');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign In to FundBridge
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Access your creator dashboard or back innovative causes
          </p>
        </div>

        {/* Quick Demo Fill Buttons */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
            One-Click Demo Credentials
          </span>
          <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setDemoCredentials('supporter')}
              className="py-1.5 px-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 text-teal-700 flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Backer</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('creator')}
              className="py-1.5 px-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 text-indigo-700 flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Creator</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('admin')}
              className="py-1.5 px-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-800 flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/40 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-teal-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In with Email'}</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Or continue with
            </span>
          </div>

          {/* Real Google OAuth Login Button */}
          {googleClientId ? (
            <div className="space-y-2">
              <div ref={googleBtnRef} className="w-full flex justify-center min-h-[40px]" />
              {!googleScriptLoaded && (
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          )}

          {/* Footer Link */}
          <p className="text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-teal-600 hover:text-teal-700">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
