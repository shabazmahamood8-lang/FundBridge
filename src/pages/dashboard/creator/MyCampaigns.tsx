import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  Clock,
  Coins,
  Edit,
  Trash2,
  AlertTriangle,
  PlusCircle,
  ExternalLink,
  CheckCircle2,
  XCircle,
  X,
} from 'lucide-react';
import api from '../../../services/api.js';
import { Campaign } from '../../../types/index.js';
import { useToast } from '../../../components/common/Toast.js';

export default function MyCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editStory, setEditStory] = useState('');
  const [editReward, setEditReward] = useState('');
  const [saving, setSaving] = useState(false);

  const { toast, confirmModal } = useToast();

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const res = await api.get('/campaigns/creator/my');
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

  const openEditModal = (camp: Campaign) => {
    setEditingCampaign(camp);
    setEditTitle(camp.campaign_title);
    setEditStory(camp.campaign_story);
    setEditReward(camp.reward_info || '');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;

    setSaving(true);
    try {
      const res = await api.patch(`/campaigns/${editingCampaign._id}`, {
        campaign_title: editTitle.trim(),
        campaign_story: editStory.trim(),
        reward_info: editReward.trim(),
      });

      if (res.data.success) {
        toast.success('Updated', 'Campaign information updated successfully.');
        setEditingCampaign(null);
        loadCampaigns();
      }
    } catch (err: any) {
      toast.error('Update Failed', err.response?.data?.message || 'Could not update campaign.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (camp: Campaign) => {
    confirmModal({
      title: 'Delete Campaign?',
      message: `Are you sure you want to delete "${camp.campaign_title}"? Any pending contributions will be refunded immediately to backer wallets.`,
      confirmText: 'Delete & Refund Backers',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await api.delete(`/campaigns/${camp._id}`);
          if (res.data.success) {
            toast.success('Campaign Deleted', 'Campaign removed and backer balances refunded.');
            setCampaigns((prev) => prev.filter((c) => c._id !== camp._id));
          }
        } catch (err: any) {
          toast.error('Delete Failed', err.response?.data?.message || 'Could not delete campaign.');
        }
      },
    });
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3" />
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3" />
            In Review
          </span>
        );
      case 'suspended':
        return (
          <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
            <AlertTriangle className="w-3 h-3" />
            Suspended
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full w-fit">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
            Portfolio
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            My Campaigns
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your submitted campaigns ordered by deadline.
          </p>
        </div>

        <Link
          to="/dashboard/add-campaign"
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Campaign</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <FolderKanban className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No campaigns launched yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You have not launched any crowdfunding campaigns yet. Start your first innovative project now!
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-100">
              <tr>
                <th className="py-3 px-4">Campaign</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Goal / Raised</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.map((camp) => (
                <tr key={camp._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={camp.campaign_image_url}
                        alt={camp.campaign_title}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <Link
                          to={`/campaigns/${camp._id}`}
                          className="font-bold text-slate-900 hover:text-teal-600 block truncate max-w-[180px]"
                        >
                          {camp.campaign_title}
                        </Link>
                        <span className="text-[10px] text-slate-400">ID: {camp._id.slice(0, 8)}...</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">{camp.category}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-extrabold text-slate-900">{camp.amount_raised} credits</p>
                    <p className="text-[10px] text-slate-500">Goal: {camp.funding_goal}</p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {new Date(camp.deadline).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4">{statusBadge(camp.status)}</td>
                  <td className="py-3.5 px-4 text-right space-x-1">
                    <button
                      onClick={() => openEditModal(camp)}
                      className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                      title="Update Campaign"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(camp)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Update Campaign</h3>
              <button
                onClick={() => setEditingCampaign(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Campaign Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Campaign Story</label>
                <textarea
                  rows={5}
                  value={editStory}
                  onChange={(e) => setEditStory(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reward Information</label>
                <textarea
                  rows={3}
                  value={editReward}
                  onChange={(e) => setEditReward(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCampaign(null)}
                  className="px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
