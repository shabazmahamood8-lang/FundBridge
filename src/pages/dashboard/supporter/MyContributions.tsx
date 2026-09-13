import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, Clock, CheckCircle2, XCircle, Compass, Coins } from 'lucide-react';
import api from '../../../services/api.js';
import { Contribution } from '../../../types/index.js';

export default function MyContributions() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContributions() {
      try {
        const res = await api.get('/contributions/my');
        if (res.data.success) {
          setContributions(res.data.contributions || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadContributions();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3" />
            Approved & Credited
          </span>
        );
      case 'pending':
        return (
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3" />
            Pending Escrow
          </span>
        );
      case 'rejected':
        return (
          <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
            <XCircle className="w-3 h-3" />
            Rejected & Refunded
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
            Impact History
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            My Contributions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track all your project pledges and creator approval statuses.
          </p>
        </div>

        <Link
          to="/dashboard/explore"
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Compass className="w-4 h-4" />
          <span>Explore More Projects</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
        </div>
      ) : contributions.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <HeartHandshake className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No contributions made yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't backed any campaigns yet. Browse innovative technology and community projects to make your first pledge!
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-100">
              <tr>
                <th className="py-3 px-4">Campaign</th>
                <th className="py-3 px-4">Creator</th>
                <th className="py-3 px-4">Pledge Amount</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contributions.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 max-w-[240px] truncate">
                    <Link
                      to={`/campaigns/${c.campaign_id}`}
                      className="hover:text-teal-600 transition-colors"
                    >
                      {c.campaign_title}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{c.creator_name}</td>
                  <td className="py-3.5 px-4 font-extrabold text-amber-700 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    <span>{c.contribution_amount} Credits</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {new Date(c.createdAt || c.current_date).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4">{getStatusBadge(c.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
