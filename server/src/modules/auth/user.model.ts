import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER', required: true }
  },
  { timestamps: true }
);

// Optimize JSON output by omitting passwordHash
UserSchema.set('toJSON', {
  transform: (_doc, ret: Record<string, any>) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  }
});

export const User = mongoose.model<IUser>('User', UserSchema);
