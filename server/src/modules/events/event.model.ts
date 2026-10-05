import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  emoji: string;
  genre: string;
  languages: string[];
  rating: string;
  certification: string;
  price: number;
  durationMinutes: number;
  showTimes: string[];
  venue: string;
  status: 'DRAFT' | 'PUBLISHED';
  lockDurationMinutes: number;
  totalRows: number;
  seatsPerRow: number;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    emoji: { type: String, default: '🎬' },
    genre: { type: String, required: true, default: 'Action · Thriller' },
    languages: { type: [String], default: ['Hindi', 'English'] },
    rating: { type: String, default: '8.5' },
    certification: { type: String, default: 'UA' },
    price: { type: Number, required: true, default: 250 },
    durationMinutes: { type: Number, default: 150 },
    showTimes: { type: [String], default: ['10:30 AM', '02:15 PM', '06:00 PM', '09:30 PM'] },
    venue: { type: String, required: true, default: 'PVR Inox, Phoenix Mall' },
    status: { type: String, enum: ['DRAFT', 'PUBLISHED'], default: 'PUBLISHED' },
    lockDurationMinutes: { type: Number, default: 10 },
    totalRows: { type: Number, default: 6 },
    seatsPerRow: { type: Number, default: 8 }
  },
  { timestamps: true }
);

export const Event = mongoose.model<IEvent>('Event', EventSchema);
