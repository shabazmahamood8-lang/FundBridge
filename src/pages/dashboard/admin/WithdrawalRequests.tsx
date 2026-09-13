import React, { useEffect, useState } from 'react';
import { Wallet, CheckCircle2, Coins, DollarSign } from 'lucide-react';
import api from '../../../services/api.js';
import { Withdrawal } from '../../../types/index.js';
import { useToast } from '../../../components/common/Toast.js';

export default function WithdrawalRequests() {
  const [requests, setRequests] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast, confirmModal } = useToast();

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/withdrawals/pending');
      if (res.data.success) {
        setRequests(res.data.withdrawals || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = (w: Withdrawal) => {
    confirmModal({
      title: 'Disburse Payout?',
      message: `Approve withdrawal of ${w.withdrawal_credit} credits ($${w.withdrawal_amount.toFixed(
        2
      )} USD) to ${w.creator_name} via ${w.payment_system} (${w.account_number})? This will deduct the credits from the creator's wallet.`,
      confirmText: 'Disburse Payout',
      onConfirm: async () => {
        try {
          const res = await api.patch(`/withdrawals/${w._id}/approve`);
          if (res.data.success) {
            toast.success('Disbursed', 'Withdrawal approved and funds released to creator.');
            setRequests((prev) => prev.filter((item) => item._id !== w._id));
          }
        } catch (err: any) {
          toast.error('Failed', err.response?.data?.message || 'Could not approve withdrawal.');
        }
      },
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
            Treasury & Disbursements
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Creator Withdrawal Requests
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit and approve creator revenue cash-out requests.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No pending withdrawal requests</h3>
          <p className="text-xs text-slate-400">All creator payout disbursements have been fulfilled.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-100">
              <tr>
                <th className="py-3 px-4">Creator</th>
                <th className="py-3 px-4">Credit Amount</th>
                <th className="py-3 px-4">USD Payout</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Account Number</th>
                <th className="py-3 px-4">Requested</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((w) => (
                <tr key={w._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <p>{w.creator_name}</p>
                    <p className="text-[10px] text-slate-400">{w.creator_email}</p>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-amber-700">
                    {w.withdrawal_credit} credits
                  </td>
                  <td className="py-3.5 px-4 font-black text-emerald-700 text-sm">
                    ${w.withdrawal_amount.toFixed(2)} USD
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">{w.payment_system}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-800">{w.account_number}</td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {new Date(w.withdraw_date || w.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleApprove(w)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      Approve Payout
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
