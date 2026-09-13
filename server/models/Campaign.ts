import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaign extends Document {
  campaign_title: string;
  campaign_story: string;
  category: 'Technology' | 'Health' | 'Education' | 'Community' | 'Environment' | 'Art' | string;
  funding_goal: number;
  minimum_contribution: number;
  deadline: Date;
  reward_info: string;
  campaign_image_url: string;
  creator_email: string;
  creator_name: string;
  amount_raised: number;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema: Schema = new Schema(
  {
    campaign_title: { type: String, required: true, trim: true },
    campaign_story: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['Technology', 'Health', 'Education', 'Community', 'Environment', 'Art', 'Other'],
      default: 'Technology',
    },
    funding_goal: { type: Number, required: true, min: 1 },
    minimum_contribution: { type: Number, required: true, min: 1, default: 5 },
    deadline: { type: Date, required: true },
    reward_info: { type: String, default: '' },
    campaign_image_url: { type: String, required: true },
    creator_email: { type: String, required: true, lowercase: true, trim: true },
    creator_name: { type: String, required: true, trim: true },
    amount_raised: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export const CampaignModel = mongoose.models.Campaign || mongoose.model<ICampaign>('Campaign', CampaignSchema);
