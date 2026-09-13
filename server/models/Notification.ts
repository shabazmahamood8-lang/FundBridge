import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  message: string;
  toEmail: string;
  actionRoute: string;
  time: Date;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    message: { type: String, required: true },
    toEmail: { type: String, required: true, lowercase: true },
    actionRoute: { type: String, default: '/dashboard' },
    time: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const NotificationModel =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
