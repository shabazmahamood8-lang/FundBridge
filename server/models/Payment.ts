import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  user_email: string;
  package_name: string;
  credits: number;
  amount: number;
  transaction_id: string;
  payment_method: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    user_email: { type: String, required: true, lowercase: true },
    package_name: { type: String, required: true },
    credits: { type: Number, required: true },
    amount: { type: Number, required: true },
    transaction_id: { type: String, required: true, unique: true },
    payment_method: { type: String, default: 'Stripe' },
    status: {
      type: String,
      enum: ['completed', 'pending', 'failed'],
      default: 'completed',
    },
  },
  { timestamps: true }
);

export const PaymentModel =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
