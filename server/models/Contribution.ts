import mongoose, { Schema, Document } from 'mongoose';

export interface IContribution extends Document {
  campaign_id: string;
  campaign_title: string;
  contribution_amount: number;
  supporter_email: string;
  supporter_name: string;
  creator_name: string;
  creator_email: string;
  current_date: Date;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContributionSchema: Schema = new Schema(
  {
    campaign_id: { type: String, required: true },
    campaign_title: { type: String, required: true },
    contribution_amount: { type: Number, required: true, min: 1 },
    supporter_email: { type: String, required: true, lowercase: true },
    supporter_name: { type: String, required: true },
    creator_name: { type: String, required: true },
    creator_email: { type: String, required: true, lowercase: true },
    current_date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    message: { type: String, default: '' },
  },
  { timestamps: true }
);

export const ContributionModel =
  mongoose.models.Contribution || mongoose.model<IContribution>('Contribution', ContributionSchema);
