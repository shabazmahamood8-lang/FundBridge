import React, { useState, useEffect } from 'react';
import { Wallet, Coins, DollarSign, ArrowDownRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../../services/api.js';
import { useAuth } from '../../../context/AuthContext.js';
import { Withdrawal } from '../../../types/index.js';
import { useToast } from '../../../components/common/Toast.js';

export default function Withdrawals() {
  const { user, updateCredits } = useAuth();
  const { toast } = useToast();

  const [withdrawCredits, setWithdrawCredits] = useState<number>(200);
  const [paymentSystem, setPaymentSystem] = useState<'Stripe' | 'Bkash' | 'Rocket' | 'Nagad'>('Stripe');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [fetching, setFetching] = useState(true);

  // Conversion rule: 20 credits = $1
  const usdAmount = (withdrawCredits / 20).toFixed(2);

  const loadWithdrawals = async () => {
    setFetching(true);
    try {
      const res = await api.get('/withdrawals/my');
      if (res.data.success) {
        setWithdrawals(res.data.withdrawals || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    if (withdrawCredits < 200) {
      toast.error('Minimum Limit', 'Minimum withdrawal is 200 credits ($10 USD).');
      return;
    }

    if (withdrawCredits > user.credits) {
      toast.error('Insufficient Credits', `You only have ${user.credits} available credits.`);
      return;
    }

    if (!accountNumber.trim()) {
      toast.error('Missing Account', 'Please provide a valid account or wallet number.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/withdrawals', {
        withdrawal_credit: Number(withdrawCredits),
        payment_system: paymentSystem,
        account_number: accountNumber.trim(),
      });

      if (res.data.success) {
        toast.success(
          'Withdrawal Requested!',
          `Your request for ${withdrawCredits} credits ($${usdAmount} USD) via ${paymentSystem} has been submitted to admin for disbursement.`
        );
        setAccountNumber('');
        loadWithdrawals();
      }
    } catch (err: any) {
      toast.error('Withdrawal Failed', err.response?.data?.message || 'Could not submit withdrawal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Overview Balance Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
              Creator Earnings & Wallet
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-3xl sm:text-4xl font-black">{user?.credits}</span>
              <span className="text-sm font-semibold text-amber-100">Available Credits</span>
            </div>
            <p className="text-xs text-amber-200/90 mt-1">
              Estimated Value: ~${((user?.credits || 0) / 20).toFixed(2)} USD (Conversion rate: 20 credits = $1.00 USD)
            </p>
          </div>

          <div className="p-4 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-xs text-xs space-y-1">
            <p className="font-bold">Withdrawal Policy:</p>
            <p className="text-amber-100">• Min threshold: 200 credits ($10 USD)</p>
            <p className="text-amber-100">• Supported: Stripe, Bkash, Rocket, Nagad</p>
            <p className="text-amber-100">• Processed within 24 business hours</p>
          </div>
        </div>
      </div>

      {/* Withdrawal Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-teal-600" />
            <span>Request Payout</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Credits will be reserved and disbursed to your payment account upon admin verification.
          </p>
        </div>

        <form onSubmit={handleWithdraw} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Credits Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Credits to Withdraw (Min 200)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={200}
                  step={10}
                  value={withdrawCredits}
                  onChange={(e) => setWithdrawCredits(Number(e.target.value))}
                  required
                  className="w-full text-sm font-bold pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                />
                <Coins className="w-4 h-4 text-amber-500 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Auto USD Output */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Calculated Payout Amount (USD)
              </label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={`$${usdAmount} USD`}
                  className="w-full text-sm font-bold pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-emerald-800 outline-hidden cursor-not-allowed"
                />
                <DollarSign className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Payment System */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Payment Channel
              </label>
              <select
                value={paymentSystem}
                onChange={(e) => setPaymentSystem(e.target.value as any)}
                className="w-full text-xs sm:text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden cursor-pointer font-medium"
              >
                <option value="Stripe">Stripe (Direct Bank)</option>
                <option value="Bkash">bKash Personal / Merchant</option>
                <option value="Rocket">Dutch-Bangla Rocket</option>
                <option value="Nagad">Nagad Wallet</option>
              </select>
            </div>

            {/* Account / Mobile Number */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {paymentSystem === 'Stripe'
                  ? 'Stripe Email / IBAN / Account Number'
                  : `${paymentSystem} Mobile Account Number`}
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder={
                  paymentSystem === 'Stripe'
                    ? 'acct_1N234... or creator@bank.com'
                    : '01XXXXXXXXX'
                }
                required
                className="w-full text-xs sm:text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Admin audit verifies campaign milestones before releasing funds.
            </span>
            <button
              type="submit"
              disabled={loading || (user?.credits || 0) < withdrawCredits}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-40"
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>{loading ? 'Submitting...' : 'Submit Withdrawal Request'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Withdrawal History Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Withdrawal History</h3>

        {fetching ? (
          <div className="py-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No withdrawal requests logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Credits</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Account</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {withdrawals.map((w) => (
                  <tr key={w._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(w.withdraw_date || w.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {w.withdrawal_credit} credits
                    </td>
                    <td className="py-3 px-4 font-extrabold text-emerald-700">
                      ${w.withdrawal_amount.toFixed(2)} USD
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{w.payment_system}</td>
                    <td className="py-3 px-4 text-slate-600">{w.account_number}</td>
                    <td className="py-3 px-4">
                      {w.status === 'approved' ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          Disbursed
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          Pending Audit
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
