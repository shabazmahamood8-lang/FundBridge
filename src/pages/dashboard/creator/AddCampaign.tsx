import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Image as ImageIcon, Calendar, Target, Coins, Gift, Sparkles, CheckCircle2 } from 'lucide-react';
import api from '../../../services/api.js';
import { useToast } from '../../../components/common/Toast.js';

export default function AddCampaign() {
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [category, setCategory] = useState('Technology');
  const [fundingGoal, setFundingGoal] = useState<number>(1000);
  const [minContribution, setMinContribution] = useState<number>(50);
  const [deadline, setDeadline] = useState('');
  const [rewardInfo, setRewardInfo] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const categories = ['Technology', 'Health', 'Education', 'Community', 'Environment', 'Art'];

  // Real backend imgBB upload for campaign cover photo
  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success && res.data.url) {
        setImageUrl(res.data.url);
        toast.success('Image Uploaded', 'Campaign visual hosted successfully on imgBB.');
      } else {
        toast.error('Upload Failed', res.data.message || 'Image upload did not return URL.');
      }
    } catch (err: any) {
      toast.error('Upload Failed', err.response?.data?.message || 'Could not upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !story.trim() || !deadline) {
      toast.error('Required Fields', 'Please complete all required campaign fields.');
      return;
    }

    if (new Date(deadline).getTime() <= Date.now()) {
      toast.error('Invalid Date', 'Deadline must be set in the future.');
      return;
    }

    if (fundingGoal <= 0 || minContribution <= 0) {
      toast.error('Invalid Numbers', 'Funding goal and minimum pledge must be greater than zero.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/campaigns', {
        campaign_title: title.trim(),
        campaign_story: story.trim(),
        category,
        funding_goal: Number(fundingGoal),
        minimum_contribution: Number(minContribution),
        deadline,
        reward_info: rewardInfo.trim(),
        campaign_image_url:
          imageUrl.trim() ||
          'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
      });

      if (res.data.success) {
        toast.success(
          'Campaign Submitted!',
          'Your project was created with pending status and sent to platform administrators for audit.'
        );
        navigate('/dashboard/my-campaigns');
      }
    } catch (err: any) {
      toast.error('Submission Failed', err.response?.data?.message || 'Could not create campaign.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
          Campaign Studio
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
          Launch a New Campaign
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Describe your innovative project, set your credit target, and submit for audit approval.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Campaign Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CleanWave: Autonomous Solar Ocean Drone"
              required
              className="w-full text-xs sm:text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Project Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs sm:text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Campaign Deadline *
            </label>
            <div className="relative">
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                className="w-full text-xs sm:text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden cursor-pointer"
              />
            </div>
          </div>

          {/* Funding Goal */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Funding Goal (Credits) *
            </label>
            <div className="relative">
              <input
                type="number"
                min={100}
                value={fundingGoal}
                onChange={(e) => setFundingGoal(Number(e.target.value))}
                required
                className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden font-bold"
              />
              <Target className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Value: ~${(fundingGoal / 20).toFixed(2)} USD (20 credits = $1)
            </span>
          </div>

          {/* Minimum Contribution */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Minimum Pledge (Credits) *
            </label>
            <div className="relative">
              <input
                type="number"
                min={10}
                value={minContribution}
                onChange={(e) => setMinContribution(Number(e.target.value))}
                required
                className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden font-bold"
              />
              <Coins className="w-4 h-4 text-amber-500 absolute left-3.5 top-3" />
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Suggested: 25 - 100 credits
            </span>
          </div>

          {/* Image URL & File Upload */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Campaign Cover Visual (URL or imgBB File Upload)
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or paste link"
                  className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden"
                />
                <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>

              <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0">
                <span>Upload File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Story */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              The Mission Story & Detailed Execution Plan *
            </label>
            <textarea
              rows={6}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Detail your engineering specifications, milestones, environmental impact, and budget allocation..."
              required
              className="w-full text-xs sm:text-sm p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden"
            />
          </div>

          {/* Backer Rewards Info */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Supporter Tiers & Backer Rewards
            </label>
            <textarea
              rows={3}
              value={rewardInfo}
              onChange={(e) => setRewardInfo(e.target.value)}
              placeholder="e.g. Tier 1 (100 credits): Digital founder badge + monthly insider updates. Tier 2 (500 credits): First-batch prototype unit."
              className="w-full text-xs sm:text-sm p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-4">
          <button
            type="submit"
            disabled={submitting || uploading}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{submitting ? 'Submitting Project...' : 'Submit for Moderation'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
