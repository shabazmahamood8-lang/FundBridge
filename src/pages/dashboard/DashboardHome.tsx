import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  Coins,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Users,
  ShieldCheck,
  PlusCircle,
  Compass,
  ArrowRight,
  Receipt,
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { Contribution } from '../../types/index.js';
import { useToast } from '../../components/common/Toast.js';

export default function DashboardHome() {
  const { user, updateCredits } = useAuth();
  const { toast, confirmModal } = useToast();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [pendingContributions, setPendingContributions] = useState<Contribution[]>([]);
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;
      setLoading(true);
      try {
        if (user.role === 'creator') {
          const [campRes, contribRes] = await Promise.all([
            api.get('/campaigns/creator/my'),
            api.get('/contributions/pending'),
          ]);
          const myCampaigns = campRes.data.campaigns || [];
          const activeCampaigns = myCampaigns.filter(
            (c: any) => c.status === 'approved' && new Date(c.deadline).getTime() > Date.now()
          );
          const totalRaised = myCampaigns.reduce((sum: number, c: any) => sum + (c.amount_raised || 0), 0);

          setStats({
            totalCampaigns: myCampaigns.length,
            activeCampaigns: activeCampaigns.length,
            totalRaised,
          });
          setPendingContributions(contribRes.data.contributions || []);
        } else if (user.role === 'supporter') {
          const res = await api.get('/contributions/my');
          const contributions = res.data.contributions || [];
          const pending = contributions.filter((c: any) => c.status === 'pending');
          const approved = contributions.filter((c: any) => c.status === 'approved');
          const totalApprovedAmount = approved.reduce(
            (sum: number, c: any) => sum + (c.contribution_amount || 0),
            0
          );

          setStats({
            totalContributions: contributions.length,
            pendingContributions: pending.length,
            totalApprovedAmount,
          });
        } else if (user.role === 'admin') {
          const res = await api.get('/admin/stats');
          if (res.data.success) {
            setStats(res.data.stats || {});
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  const handleApproveContribution = (c: Contribution) => {
    confirmModal({
      title: 'Approve Contribution?',
      message: `Are you sure you want to approve ${c.contribution_amount} credits from ${c.supporter_name}? This will add the credits to your campaign balance.`,
      confirmText: 'Approve Contribution',
      onConfirm: async () => {
        try {
          const res = await api.patch(`/contributions/${c._id}/approve`);
          if (res.data.success) {
            toast.success('Approved', 'Contribution accepted and funds credited.');
            setPendingContributions((prev) => prev.filter((item) => item._id !== c._id));
            setStats((prev: any) => ({
              ...prev,
              totalRaised: (prev.totalRaised || 0) + c.contribution_amount,
            }));
            if (selectedContribution?._id === c._id) setSelectedContribution(null);
          }
        } catch (err: any) {
          toast.error('Failed', err.response?.data?.message || 'Could not approve contribution.');
        }
      },
    });
  };

  const handleRejectContribution = (c: Contribution) => {
    confirmModal({
      title: 'Reject & Refund Contribution?',
      message: `Rejecting will immediately refund ${c.contribution_amount} credits back to ${c.supporter_name}'s wallet.`,
      confirmText: 'Reject & Refund',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await api.patch(`/contributions/${c._id}/reject`);
          if (res.data.success) {
            toast.info('Rejected', 'Contribution rejected and credits refunded to backer.');
            setPendingContributions((prev) => prev.filter((item) => item._id !== c._id));
            if (selectedContribution?._id === c._id) setSelectedContribution(null);
          }
        } catch (err: any) {
          toast.error('Failed', err.response?.data?.message || 'Could not reject contribution.');
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-200/80 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-teal-700 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-teal-700/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-200">
            Welcome Back
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1">
            {user?.name}
          </h1>
          <p className="text-xs text-teal-100/90 mt-1 max-w-md">
            {user?.role === 'creator'
              ? 'Manage your live campaigns, review supporter contributions, and initiate withdrawals.'
              : user?.role === 'supporter'
              ? 'Track your active project pledges, review tier rewards, or add more credits.'
              : 'Global platform supervision: approve campaigns, manage user roles, and resolve reports.'}
          </p>
        </div>

        {user?.role === 'creator' && (
          <Link
            to="/dashboard/add-campaign"
            className="px-4 py-2.5 bg-white text-teal-800 font-bold text-xs rounded-xl shadow-xs hover:bg-teal-50 transition-colors flex items-center gap-2 self-start sm:self-auto shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-teal-600" />
            <span>Launch New Campaign</span>
          </Link>
        )}

        {user?.role === 'supporter' && (
          <Link
            to="/dashboard/purchase-credit"
            className="px-4 py-2.5 bg-white text-teal-800 font-bold text-xs rounded-xl shadow-xs hover:bg-teal-50 transition-colors flex items-center gap-2 self-start sm:self-auto shrink-0"
          >
            <Coins className="w-4 h-4 text-amber-500" />
            <span>Get Credits</span>
          </Link>
        )}
      </div>

      {/* CREATOR DASHBOARD VIEW */}
      {user?.role === 'creator' && (
        <>
          {/* Creator Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold">Total Campaigns</span>
                <FolderKanban className="w-4 h-4 text-teal-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{stats.totalCampaigns || 0}</p>
              <p className="text-[11px] text-slate-500">Created by your account</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold">Active Campaigns</span>
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{stats.activeCampaigns || 0}</p>
              <p className="text-[11px] text-slate-500">Currently accepting pledges</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold">Total Raised</span>
                <Coins className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-slate-900">
                {stats.totalRaised || 0} <span className="text-xs font-normal text-slate-500">credits</span>
              </p>
              <p className="text-[11px] text-slate-500">Value: ~${((stats.totalRaised || 0) / 20).toFixed(2)} USD</p>
            </div>
          </div>

          {/* Pending Contributions Review Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Pending Contributions to Review</span>
                  <span className="text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                    {pendingContributions.length} Pending
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Supporters have pledged credits. Review and approve to release funds to your campaign.
                </p>
              </div>
            </div>

            {pendingContributions.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-slate-700">All contributions reviewed!</p>
                <p className="text-[11px] text-slate-400">
                  New supporter pledges will appear here for your review and acceptance.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Campaign</th>
                      <th className="py-3 px-4">Supporter</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingContributions.map((c) => (
                      <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-800 max-w-[200px] truncate">
                          {c.campaign_title}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <p className="font-semibold text-slate-800">{c.supporter_name}</p>
                          <p className="text-[10px] text-slate-400">{c.supporter_email}</p>
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-amber-700">
                          {c.contribution_amount} Credits
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {new Date(c.createdAt || c.current_date).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => setSelectedContribution(c)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleApproveContribution(c)}
                            className="px-2.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectContribution(c)}
                            className="px-2.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* SUPPORTER DASHBOARD VIEW */}
      {user?.role === 'supporter' && (
        <>
          {/* Supporter Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold">Total Pledges</span>
                <TrendingUp className="w-4 h-4 text-teal-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{stats.totalContributions || 0}</p>
              <p className="text-[11px] text-slate-500">Campaign contributions submitted</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold">Pending Escrow</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-slate-900">{stats.pendingContributions || 0}</p>
              <p className="text-[11px] text-slate-500">Awaiting creator approval</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold">Approved Impact</span>
                <Coins className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">
                {stats.totalApprovedAmount || 0} <span className="text-xs font-normal text-slate-500">credits</span>
              </p>
              <p className="text-[11px] text-slate-500">Successfully credited to creators</p>
            </div>
          </div>

          {/* Quick Action Hub */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 space-y-3 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-teal-600" />
                <span>Explore Active Innovations</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Discover new verified campaigns across Clean Energy, Biomedical Technology, and Education.
              </p>
              <Link
                to="/dashboard/explore"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800"
              >
                <span>Browse Campaigns</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 space-y-3 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-500" />
                <span>Wallet & Credits</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You currently have <strong>{user?.credits} credits</strong> available in your wallet.
              </p>
              <Link
                to="/dashboard/purchase-credit"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-900"
              >
                <span>Purchase Credit Packages</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </>
      )}

      {/* ADMIN DASHBOARD VIEW */}
      {user?.role === 'admin' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">Supporters</span>
              <p className="text-2xl font-black text-slate-900">{stats.totalSupporters || 0}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">Creators</span>
              <p className="text-2xl font-black text-slate-900">{stats.totalCreators || 0}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">Circulating Credits</span>
              <p className="text-2xl font-black text-amber-700">{stats.totalCredits || 0}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">Payments Processed</span>
              <p className="text-2xl font-black text-teal-700">${stats.totalPaymentsAmount || 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Link
              to="/dashboard/manage-campaigns"
              className="bg-white p-6 rounded-3xl border border-slate-200/80 hover:border-teal-400 transition-colors shadow-xs space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">Campaign Moderation</span>
                <FolderKanban className="w-5 h-5 text-teal-600" />
              </div>
              <p className="text-xs text-slate-500">
                Review submitted campaign drafts, approve legitimate innovations, and suspend flagged projects.
              </p>
            </Link>

            <Link
              to="/dashboard/withdrawal-requests"
              className="bg-white p-6 rounded-3xl border border-slate-200/80 hover:border-teal-400 transition-colors shadow-xs space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">Disbursement Approvals</span>
                <Receipt className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-xs text-slate-500">
                Audit creator cash-out requests via Stripe, Bkash, Rocket, and Nagad.
              </p>
            </Link>
          </div>
        </>
      )}

      {/* View Contribution Modal */}
      {selectedContribution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Contribution Details</h3>
              <button
                onClick={() => setSelectedContribution(null)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Campaign</span>
                <p className="font-bold text-slate-900">{selectedContribution.campaign_title}</p>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Supporter</span>
                <p className="font-semibold text-slate-800">
                  {selectedContribution.supporter_name} ({selectedContribution.supporter_email})
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Pledge Amount</span>
                <p className="text-base font-extrabold text-amber-700">
                  {selectedContribution.contribution_amount} Credits (~$
                  {(selectedContribution.contribution_amount / 20).toFixed(2)} USD)
                </p>
              </div>

              {selectedContribution.message && (
                <div>
                  <span className="text-slate-400 font-medium">Supporter Message</span>
                  <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 italic">
                    "{selectedContribution.message}"
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => handleRejectContribution(selectedContribution)}
                className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg"
              >
                Reject & Refund
              </button>
              <button
                onClick={() => handleApproveContribution(selectedContribution)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
              >
                Approve Contribution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
