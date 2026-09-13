import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, Check, CreditCard, Sparkles, ShieldCheck, Zap, X, Lock, ExternalLink, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../../../services/api.js';
import { useAuth } from '../../../context/AuthContext.js';
import { useToast } from '../../../components/common/Toast.js';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
  bonus?: string;
  description: string;
}

export default function PurchaseCredits() {
  const { user, updateCredits } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [processing, setProcessing] = useState(false);
  const [verifyingSession, setVerifyingSession] = useState(false);

  // Exact credit packages as specified in requirements:
  // 100 credits = $10, 300 credits = $25, 800 credits = $60, 1500 credits = $110
  const packages: CreditPackage[] = [
    {
      id: 'pkg_100',
      name: 'Starter Backer',
      credits: 100,
      price: 10,
      description: 'Ideal for trying out FundBridge and backing your first innovative cause.',
    },
    {
      id: 'pkg_300',
      name: 'Pioneer Supporter',
      credits: 300,
      price: 25,
      popular: true,
      bonus: '+16% Value',
      description: 'Our most popular pack for enthusiasts who back multiple hardware prototypes.',
    },
    {
      id: 'pkg_800',
      name: 'Impact Advocate',
      credits: 800,
      price: 60,
      bonus: '+33% Bonus',
      description: 'High impact backing with priority rewards on hardware campaigns.',
    },
    {
      id: 'pkg_1500',
      name: 'Patron Founder',
      credits: 1500,
      price: 110,
      bonus: '+36% Best Deal',
      description: 'Maximum credit tier with dedicated platform recognition and tier rewards.',
    },
  ];

  // Handle return from Stripe Checkout redirect
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const sessionId = query.get('session_id');
    const isSuccess = query.get('success') === 'true';
    const isCanceled = query.get('canceled') === 'true';

    if (isSuccess && sessionId) {
      setVerifyingSession(true);
      const verifyStripeSession = async () => {
        try {
          const res = await api.post('/payments/verify-session', { sessionId });
          if (res.data.success) {
            if (res.data.newBalance !== undefined) {
              updateCredits(res.data.newBalance);
            }
            confetti({
              particleCount: 120,
              spread: 90,
              origin: { y: 0.6 },
            });
            toast.success(
              'Payment Verified!',
              res.data.alreadyProcessed
                ? 'Your transaction was confirmed and credits are available in your wallet.'
                : `Successfully added credits! Your new balance is ${res.data.newBalance} credits.`
            );
          }
        } catch (err: any) {
          toast.error(
            'Verification Notice',
            err.response?.data?.message || 'Could not verify checkout session with Stripe.'
          );
        } finally {
          setVerifyingSession(false);
          // Clean URL parameters
          navigate('/dashboard/purchase-credit', { replace: true });
        }
      };

      verifyStripeSession();
    } else if (isCanceled) {
      toast.error('Payment Canceled', 'Stripe checkout was canceled. No charges were made.');
      navigate('/dashboard/purchase-credit', { replace: true });
    }
  }, [navigate, updateCredits, toast]);

  const handleOpenPayment = (pkg: CreditPackage) => {
    setSelectedPackage(pkg);
  };

  const handleProceedToStripe = async (pkg: CreditPackage) => {
    if (!user) {
      toast.error('Authentication Required', 'Please log in to purchase credits.');
      return;
    }

    setProcessing(true);
    try {
      // Create official Stripe checkout session on the backend
      const res = await api.post('/payments/create-checkout-session', {
        packageId: pkg.id,
      });

      if (res.data.success && res.data.url) {
        // Redirect directly to Stripe-hosted checkout page
        window.location.href = res.data.url;
      } else {
        throw new Error(res.data.message || 'Stripe did not return a valid checkout session URL.');
      }
    } catch (err: any) {
      toast.error(
        'Stripe Checkout Error',
        err.response?.data?.message || 'Could not initiate Stripe checkout. Please ensure STRIPE_SECRET_KEY is configured.'
      );
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Verifying Session Loading Banner */}
      {verifyingSession && (
        <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex items-center gap-3 text-teal-800 text-xs font-semibold animate-pulse">
          <Loader2 className="w-5 h-5 animate-spin text-teal-600 shrink-0" />
          <span>Verifying Stripe checkout session and updating your wallet balance...</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-bold border border-teal-400/30">
            <Coins className="w-3.5 h-3.5" />
            <span>Instant Wallet Top-up with Stripe</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Purchase Platform Credits
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Credits give you immediate backing power with zero transaction fees on individual pledges. 100% refundable if a campaign is cancelled.
          </p>
        </div>

        <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl p-5 text-center shrink-0 w-full sm:w-auto">
          <span className="text-xs uppercase font-bold text-teal-200">Current Balance</span>
          <p className="text-3xl font-black text-amber-300 mt-1">{user?.credits}</p>
          <span className="text-[11px] text-slate-300">Available Credits</span>
        </div>
      </div>

      {/* Package Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 relative ${
              pkg.popular
                ? 'bg-white border-2 border-teal-500 shadow-xl shadow-teal-900/10'
                : 'bg-white border border-slate-200/80 shadow-xs hover:shadow-md'
            }`}
          >
            {pkg.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                Most Popular
              </span>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">{pkg.name}</h3>
                {pkg.bonus && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {pkg.bonus}
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">${pkg.price}</span>
                  <span className="text-xs text-slate-500 font-semibold">USD</span>
                </div>
                <div className="flex items-center gap-1 text-sm font-extrabold text-teal-700 mt-1">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span>{pkg.credits} Credits</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{pkg.description}</p>
            </div>

            <button
              onClick={() => handleOpenPayment(pkg)}
              disabled={processing}
              className={`w-full mt-6 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                pkg.popular
                  ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Buy {pkg.credits} Credits</span>
            </button>
          </div>
        ))}
      </div>

      {/* Stripe Payment Confirmation Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Stripe Checkout</h3>
                  <p className="text-[11px] text-slate-400">Official 256-bit Encrypted Stripe Gateway</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPackage(null)}
                disabled={processing}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Summary */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-900">{selectedPackage.name}</p>
                <p className="text-teal-700 font-semibold">{selectedPackage.credits} Credits Added to Wallet</p>
              </div>
              <span className="text-base font-black text-slate-900">
                ${selectedPackage.price}.00 USD
              </span>
            </div>

            {/* Supported Payment Methods Notice */}
            <div className="space-y-3">
              <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-xl text-xs text-teal-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Stripe Hosted Payment Protection</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  You will be securely redirected to Stripe's checkout page to complete your payment with Credit Card, Debit Card, Apple Pay, or Google Pay.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleProceedToStripe(selectedPackage)}
                disabled={processing}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting to Stripe...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Stripe Checkout</span>
                    <ExternalLink className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSelectedPackage(null)}
                disabled={processing}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              Powered by Stripe. Test card 4242 4242 4242 4242 is accepted in Test Mode.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
