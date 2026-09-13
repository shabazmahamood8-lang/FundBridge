import React, { useEffect, useState } from 'react';
import { Receipt, CreditCard, Coins, CheckCircle2 } from 'lucide-react';
import api from '../../../services/api.js';
import { Payment } from '../../../types/index.js';

export default function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      try {
        const res = await api.get('/payments/history');
        if (res.data.success) {
          setPayments(res.data.payments || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPayments();
  }, []);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
            Billing Records
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Payment & Credit History
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View all credit purchases and verified gateway transaction receipts.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <Receipt className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No payment receipts found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When you purchase platform credits via Stripe, your verified transaction receipts will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-100">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Package</th>
                <th className="py-3 px-4">Credits Added</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                    {p.transaction_id}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{p.package_name}</td>
                  <td className="py-3.5 px-4 font-bold text-amber-700 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    <span>+{p.credits} Credits</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">${p.amount.toFixed(2)} USD</td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
                      <CheckCircle2 className="w-3 h-3" />
                      Completed
                    </span>
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
