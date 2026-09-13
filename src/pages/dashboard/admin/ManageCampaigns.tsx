import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Trash2,
  Eye,
  Search,
} from 'lucide-react';
import api from '../../../services/api.js';
import { Campaign } from '../../../types/index.js';
import { useToast } from '../../../components/common/Toast.js';

export default function ManageCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { toast, confirmModal } = useToast();

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const res = await api.get('/campaigns', {
        params: {
          onlyActive: 'false',
          limit: 100,
        },
      });
      if (res.data.success) {
        setCampaigns(res.data.campaigns || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleApprove = async (camp: Campaign) => {
    try {
      const res = await api.patch(`/admin/campaigns/${camp._id}/approve`);
      if (res.data.success) {
        toast.success('Approved', `"${camp.campaign_title}" is now published and active.`);
        setCampaigns((prev) =>
          prev.map((c) => (c._id === camp._id ? { ...c, status: 'approved' } : c))
        );
      }
    } catch (err: any) {
      toast.error('Failed', err.response?.data?.message || 'Could not approve campaign.');
    }
  };

  const handleReject = async (camp: Campaign) => {
    try {
      const res = await api.patch(`/admin/campaigns/${camp._id}/reject`);
      if (res.data.success) {
        toast.info('Rejected', `"${camp.campaign_title}" was rejected.`);
        setCampaigns((prev) =>
          prev.map((c) => (c._id === camp._id ? { ...c, status: 'rejected' } : c))
        );
      }
    } catch (err: any) {
      toast.error('Failed', err.response?.data?.message || 'Could not reject campaign.');
    }
  };

  const handleToggleSuspend = async (camp: Campaign) => {
    const isSuspending = camp.status !== 'suspended';
    confirmModal({
      title: isSuspending ? 'Suspend Campaign?' : 'Unsuspend Campaign?',
      message: isSuspending
        ? `Suspending "${camp.campaign_title}" will immediately freeze new pledges and hide it from the public directory.`
        : `Re-activating "${camp.campaign_title}" will restore public visibility.`,
      confirmText: isSuspending ? 'Suspend' : 'Unsuspend',
      isDestructive: isSuspending,
      onConfirm: async () => {
        try {
          const res = await api.patch(`/admin/campaigns/${camp._id}/suspend`, {
            suspend: isSuspending,
          });
          if (res.data.success) {
            toast.success(
              isSuspending ? 'Suspended' : 'Reactivated',
              `Campaign status updated to ${isSuspending ? 'suspended' : 'approved'}.`
            );
            setCampaigns((prev) =>
              prev.map((c) =>
                c._id === camp._id ? { ...c, status: isSuspending ? 'suspended' : 'approved' } : c
              )
            );
          }
        } catch (err: any) {
          toast.error('Failed', err.response?.data?.message || 'Could not update suspension.');
        }
      },
    });
  };

  const handleDelete = (camp: Campaign) => {
    confirmModal({
      title: 'Delete Campaign Permanently?',
      message: `Are you sure you want to delete "${camp.campaign_title}"? All associated backer funds will be refunded.`,
      confirmText: 'Delete Campaign',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await api.delete(`/campaigns/${camp._id}`);
          if (res.data.success) {
            toast.success('Deleted', 'Campaign removed from platform.');
            setCampaigns((prev) => prev.filter((c) => c._id !== camp._id));
          }
        } catch (err: any) {
          toast.error('Failed', err.response?.data?.message || 'Could not delete campaign.');
        }
      },
    });
  };

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSearch =
      c.campaign_title.toLowerCase().includes(search.toLowerCase()) ||
      c.creator_name.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
            Platform Moderation
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Manage All Campaigns
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Approve project submissions, audit fraudulent campaigns, and manage platform listings.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns or creators..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-purple-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['all', 'pending', 'approved', 'suspended', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs">
          No campaigns match your filter criteria.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-100">
              <tr>
                <th className="py-3 px-4">Campaign</th>
                <th className="py-3 px-4">Creator</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Goal / Raised</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCampaigns.map((camp) => (
                <tr key={camp._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 max-w-[200px] truncate">
                    <Link
                      to={`/campaigns/${camp._id}`}
                      className="hover:text-purple-600 transition-colors flex items-center gap-1.5"
                    >
                      <span>{camp.campaign_title}</span>
                      <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{camp.creator_name}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">{camp.category}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-extrabold text-slate-900">{camp.amount_raised} credits</p>
                    <p className="text-[10px] text-slate-500">Goal: {camp.funding_goal}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        camp.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : camp.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : camp.status === 'suspended'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {camp.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1">
                    {camp.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(camp)}
                          className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(camp)}
                          className="px-2.5 py-1 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {camp.status !== 'pending' && (
                      <button
                        onClick={() => handleToggleSuspend(camp)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer border ${
                          camp.status === 'suspended'
                            ? 'text-teal-700 bg-teal-50 border-teal-200 hover:bg-teal-100'
                            : 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {camp.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(camp)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
