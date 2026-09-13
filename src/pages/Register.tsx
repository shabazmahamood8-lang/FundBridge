import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, User, Mail, Lock, Image as ImageIcon, CheckCircle2, Shield } from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../components/common/Toast.js';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'supporter' | 'creator'>('supporter');
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Real backend imgBB image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success && res.data.url) {
        setPhotoUrl(res.data.url);
        toast.success('Image Uploaded', 'Avatar successfully uploaded and hosted on imgBB.');
      } else {
        toast.error('Upload Failed', res.data.message || 'Image upload did not return URL.');
      }
    } catch (err: any) {
      toast.error('Upload Failed', err.response?.data?.message || 'Could not upload image to server.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      toast.error('Missing Info', 'Please fill in all required registration fields.');
      return;
    }

    if (password.length < 6) {
      toast.error('Weak Password', 'Password must be at least 6 characters in length.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        photoUrl: photoUrl.trim() || undefined,
      });

      toast.success(
        'Welcome to FundBridge!',
        `Your account was registered. You received ${role === 'supporter' ? '50' : '20'} complimentary onboarding credits!`
      );
      navigate('/dashboard');
    } catch (err: any) {
      toast.error('Registration Failed', err.response?.data?.message || 'Could not register user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-teal-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs text-slate-500">
            Join thousands of innovators and community backers.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl shadow-slate-200/40 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Role Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Choose Your Primary Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('supporter')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    role === 'supporter'
                      ? 'border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">Supporter</span>
                    {role === 'supporter' && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Back projects & earn backer rewards
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-full">
                    +50 Starting Credits
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('creator')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    role === 'creator'
                      ? 'border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">Creator</span>
                    {role === 'creator' && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Launch campaigns & receive funding
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-full">
                    +20 Starting Credits
                  </span>
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Elena Rostova"
                  required
                  className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="elena@example.com"
                  required
                  className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Avatar / imgBB Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Profile Photo (URL or imgBB File)
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or paste image link"
                    className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden"
                  />
                  <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg cursor-pointer transition-colors">
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {photoUrl && (
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Avatar attached
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
            </button>
          </form>

          <p className="text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-teal-600 hover:text-teal-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
