import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  Target,
  Coins,
  ShieldCheck,
  AlertTriangle,
  Gift,
  Share2,
  Flag,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api.js';
import { Campaign } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../components/common/Toast.js';
import ReportModal from '../components/common/ReportModal.js';

export default function CampaignDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, updateCredits } = useAuth();
  const { toast } = useToast();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [contributionAmount, setContributionAmount] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    async function loadCampaign() {
      try {
        const res = await api.get(`/campaigns/${id}`);
        if (res.data.success) {
          setCampaign(res.data.campaign);
          if (res.data.campaign.minimum_contribution) {
            setContributionAmount(String(res.data.campaign.minimum_contribution));
          }
        }
      } catch (err) {
        toast.error('Not Found', 'The requested campaign could not be located.');
        navigate('/campaigns');
      } finally {
        setLoading(false);
      }
    }
    loadCampaign();
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 flex justify-center">
        <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!campaign) return null;

  const percentage = Math.min(
    100,
    Math.round(((campaign.amount_raised || 0) / (campaign.funding_goal || 1)) * 100)
  );

  const remainingCredits = Math.max(0, campaign.funding_goal - (campaign.amount_raised || 0));
  const deadlineDate = new Date(campaign.deadline);
  const isExpired = deadlineDate.getTime() < Date.now();
  const daysLeft = Math.max(0, Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.info('Sign in Required', 'Please log in to pledge your credits to this campaign.');
      navigate('/login', { state: { from: { pathname: `/campaigns/${campaign._id}` } } });
      return;
    }

    const amount = Number(contributionAmount);

    if (isNaN(amount) || amount < campaign.minimum_contribution) {
      toast.error('Invalid Amount', `Minimum contribution is ${campaign.minimum_contribution} credits.`);
      return;
    }

    if (amount > user.credits) {
      toast.error(
        'Insufficient Credits',
        `You have ${user.credits} credits. Please purchase additional credits to complete this pledge.`
      );
      return;
    }

    if (isExpired) {
      toast.error('Campaign Concluded', 'This campaign has passed its deadline and no longer accepts contributions.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/contributions', {
        campaign_id: campaign._id,
        contribution_amount: amount,
        message,
      });

      if (res.data.success) {
        updateCredits(res.data.remainingCredits);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        toast.success(
          'Contribution Submitted!',
          `Your contribution of ${amount} credits was escrowed and sent to creator ${campaign.creator_name} for approval.`
        );
        setMessage('');
      }
    } catch (err: any) {
      toast.error('Contribution Failed', err.response?.data?.message || 'Could not process contribution.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link Copied', 'Campaign URL copied to clipboard.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back Link */}
      <Link
        to="/campaigns"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to All Campaigns
      </Link>

      {/* Main Campaign Header & Media */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold px-3 py-1 bg-teal-50 text-teal-700 rounded-full border border-teal-200">
            {campaign.category}
          </span>
          {campaign.status === 'approved' && !isExpired && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified Active Campaign
            </span>
          )}
          {isExpired && (
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Campaign Deadline Concluded
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {campaign.campaign_title}
        </h1>

        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span>Created by <strong className="text-slate-900">{campaign.creator_name}</strong></span>
          <span>•</span>
          <span>Initiated on {new Date(campaign.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Hero Grid: Media + Funding Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image & Story */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Visual */}
          <div className="rounded-3xl overflow-hidden aspect-video w-full bg-slate-100 shadow-sm border border-slate-200">
            <img
              src={campaign.campaign_image_url}
              alt={campaign.campaign_title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Campaign Story */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <h2 className="text-xl font-bold text-slate-900 pb-3 border-b border-slate-100">
              The Mission & Story
            </h2>
            <div className="text-sm text-slate-700 leading-relaxed space-y-4 whitespace-pre-line">
              {campaign.campaign_story}
            </div>

            {/* Reward Information */}
            {campaign.reward_info && (
              <div className="mt-6 p-5 bg-teal-50/50 border border-teal-200/70 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
                  <Gift className="w-4 h-4 text-teal-600" />
                  <span>Backer Tiers & Rewards</span>
                </div>
                <p className="text-xs text-teal-900/80 leading-relaxed whitespace-pre-line">
                  {campaign.reward_info}
                </p>
              </div>
            )}

            {/* Campaign Actions (Share & Report) */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-slate-400" />
                Share Campaign
              </button>

              <button
                onClick={() => setReportModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 p-2 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5" />
                Report Suspicious Activity
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Funding Widget & Contribution Form */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-6 sticky top-24">
            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-teal-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-slate-900">
                    {campaign.amount_raised}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    of {campaign.funding_goal} goal
                  </span>
                </div>
                <p className="text-xs text-teal-700 font-semibold">
                  {percentage}% raised • {remainingCredits} credits remaining
                </p>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 text-xs">
              <div>
                <p className="text-slate-500 font-medium">Days Remaining</p>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {isExpired ? 'Concluded' : `${daysLeft} Days`}
                </p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Minimum Pledge</p>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  {campaign.minimum_contribution} Credits
                </p>
              </div>
            </div>

            {/* Contribution Form */}
            {!isExpired ? (
              <form onSubmit={handleContribute} className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <label htmlFor="pledge-amount" className="font-bold text-slate-800">
                      Contribution Amount (Credits)
                    </label>
                    {user && (
                      <span className="text-slate-500">
                        Balance: <strong className="text-amber-700">{user.credits}</strong>
                      </span>
                    )}
                  </div>
                  <input
                    id="pledge-amount"
                    type="number"
                    min={campaign.minimum_contribution}
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    required
                    className="w-full text-sm font-bold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="backer-message" className="block text-xs font-semibold text-slate-700">
                    Backer Message (Optional)
                  </label>
                  <textarea
                    id="backer-message"
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Leave a word of encouragement for the creator..."
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden resize-none"
                  />
                </div>

                {user && user.credits < Number(contributionAmount) && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                    <p className="font-semibold">Insufficient Credits Available</p>
                    <Link
                      to="/dashboard/purchase-credit"
                      className="text-amber-900 font-bold underline inline-block"
                    >
                      Top up credits now →
                    </Link>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{submitting ? 'Submitting Pledge...' : 'Back This Project'}</span>
                </button>

                <p className="text-[11px] text-slate-400 text-center leading-tight">
                  Contributions are held in safe escrow until approved by creator.
                </p>
              </form>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
                <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto" />
                <p className="text-xs font-bold text-slate-800">Campaign Has Closed</p>
                <p className="text-[11px] text-slate-500">
                  This campaign reached its deadline and is no longer accepting new pledges.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        campaignId={campaign._id}
        campaignTitle={campaign.campaign_title}
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
    </div>
  );
}
