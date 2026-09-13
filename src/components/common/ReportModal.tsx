import React, { useState } from 'react';
import { AlertCircle, X, ShieldAlert } from 'lucide-react';
import api from '../../services/api.js';
import { useToast } from './Toast.js';

interface ReportModalProps {
  campaignId: string;
  campaignTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportModal({
  campaignId,
  campaignTitle,
  isOpen,
  onClose,
}: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Reason Required', 'Please provide detailed reason for reporting this campaign.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/reports', {
        campaign_id: campaignId,
        campaign_title: campaignTitle,
        reason: reason.trim(),
      });
      if (res.data.success) {
        toast.success('Report Submitted', 'Our moderation team will audit this campaign immediately.');
        setReason('');
        onClose();
      }
    } catch (err: any) {
      toast.error('Report Failed', err.response?.data?.message || 'Could not submit report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-rose-600">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 text-base">Report Campaign</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Campaign
            </label>
            <p className="text-sm font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
              {campaignTitle}
            </p>
          </div>

          <div>
            <label htmlFor="report-reason" className="block text-xs font-semibold text-slate-700 mb-1">
              Why are you reporting this campaign?
            </label>
            <textarea
              id="report-reason"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide specific concerns regarding copyright, misleading promises, or suspicious activity..."
              className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-hidden resize-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Filing Report...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
