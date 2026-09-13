import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Target, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Campaign } from '../../types/index.js';

interface CampaignCardProps {
  campaign: Campaign;
  key?: React.Key;
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const percentage = Math.min(
    100,
    Math.round(((campaign.amount_raised || 0) / (campaign.funding_goal || 1)) * 100)
  );

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  const categoryColors: Record<string, string> = {
    Technology: 'bg-blue-50 text-blue-700 border-blue-200',
    Health: 'bg-rose-50 text-rose-700 border-rose-200',
    Education: 'bg-amber-50 text-amber-700 border-amber-200',
    Community: 'bg-teal-50 text-teal-700 border-teal-200',
    Environment: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Art: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const badgeClass =
    categoryColors[campaign.category] || 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-teal-300 shadow-sm hover:shadow-xl hover:shadow-teal-900/5 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        <img
          src={campaign.campaign_image_url}
          alt={campaign.campaign_title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shadow-xs backdrop-blur-xs ${badgeClass}`}>
            {campaign.category}
          </span>
        </div>
        {percentage >= 100 && (
          <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Funded</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
            <span>By {campaign.creator_name}</span>
          </div>

          <Link
            to={`/campaigns/${campaign._id}`}
            className="block text-base font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-1 mb-2"
          >
            {campaign.campaign_title}
          </Link>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {campaign.campaign_story}
          </p>
        </div>

        {/* Progress Bar & Stats */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentage >= 100 ? 'bg-emerald-500' : 'bg-teal-600'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <div>
              <p className="font-extrabold text-slate-900 text-sm">{campaign.amount_raised} <span className="font-normal text-xs text-slate-500">credits</span></p>
              <p className="text-[11px] text-slate-500">{percentage}% of {campaign.funding_goal} goal</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-800 flex items-center justify-end gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {daysLeft} days
              </p>
              <p className="text-[11px] text-slate-500">remaining</p>
            </div>
          </div>

          {/* View Details Button */}
          <Link
            to={`/campaigns/${campaign._id}`}
            className="w-full mt-3 py-2.5 px-4 bg-slate-50 hover:bg-teal-50 group-hover:bg-teal-600 text-slate-700 group-hover:text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <span>View Details</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
