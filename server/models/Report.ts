import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  campaign_id: string;
  campaign_title: string;
  reporter_name: string;
  reporter_email: string;
  reason: string;
  date: Date;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema: Schema = new Schema(
  {
    campaign_id: { type: String, required: true },
    campaign_title: { type: String, required: true },
    reporter_name: { type: String, required: true },
    reporter_email: { type: String, required: true, lowercase: true },
    reason: { type: String, required: true },
    date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export const ReportModel =
  mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
