import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  photoUrl?: string;
  passwordHash: string;
  role: 'supporter' | 'creator' | 'admin';
  credits: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    photoUrl: { type: String, default: '' },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['supporter', 'creator', 'admin'], default: 'supporter' },
    credits: { type: Number, default: 50 },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
