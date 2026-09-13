import React, { useEffect, useState } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Eye, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../../services/api.js';
import { ReportItem } from '../../../types/index.js';
import { useToast } from '../../../components/common/Toast.js';

export default function Reports() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast, confirmModal } = useToast();

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports');
      if (res.data.success) {
        setReports(res.data.reports || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleUpdateStatus = async (reportId: string, status: 'reviewed' | 'resolved') => {
    try {
      const res = await api.patch(`/reports/${reportId}`, { status });
      if (res.data.success) {
        toast.success('Updated', `Report marked as ${status}.`);
        setReports((prev) =>
          prev.map((r) => (r._id === reportId ? { ...r, status } : r))
        );
      }
    } catch (err: any) {
      toast.error('Failed', err.response?.data?.message || 'Could not update report.');
    }
  };

  const handleSuspendCampaign = (r: ReportItem) => {
    confirmModal({
      title: 'Suspend Reported Campaign?',
      message: `Suspending "${r.campaign_title}" will freeze pledges and hide it from the public directory.`,
      confirmText: 'Suspend Campaign',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await api.patch(`/admin/campaigns/${r.campaign_id}/suspend`, { suspend: true });
          await api.patch(`/reports/${r._id}`, { status: 'resolved' });
          toast.success('Campaign Suspended', 'Campaign suspended and report resolved.');
          loadReports();
        } catch (err: any) {
          toast.error('Failed', err.response?.data?.message || 'Action could not be executed.');
        }
      },
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
            Trust & Safety
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Campaign Audit Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Supporter-submitted fraud and copyright violation reports.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <ShieldAlert className="w-8 h-8 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No active reports filed</h3>
          <p className="text-xs text-slate-400">Platform campaigns are currently clear of fraud flags.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-100">
              <tr>
                <th className="py-3 px-4">Campaign</th>
                <th className="py-3 px-4">Reporter</th>
                <th className="py-3 px-4">Report Reason</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 max-w-[200px] truncate">
                    <Link
                      to={`/campaigns/${r.campaign_id}`}
                      className="hover:text-rose-600 flex items-center gap-1"
                    >
                      <span>{r.campaign_title}</span>
                      <ArrowUpRight className="w-3 h-3 text-slate-400" />
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <p className="font-semibold">{r.reporter_name}</p>
                    <p className="text-[10px] text-slate-400">{r.reporter_email}</p>
                  </td>
                  <td className="py-3.5 px-4 max-w-[240px] text-slate-700 leading-relaxed">
                    {r.reason}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {new Date(r.date).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                        r.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : r.status === 'reviewed'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    {r.status !== 'resolved' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(r._id, 'resolved')}
                          className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 cursor-pointer"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => handleSuspendCampaign(r)}
                          className="px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 cursor-pointer"
                        >
                          Suspend Campaign
                        </button>
                      </>
                    )}
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
