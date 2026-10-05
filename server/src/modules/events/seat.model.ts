import mongoose, { Schema, Document } from 'mongoose';

export interface ISeat extends Document {
  eventId: mongoose.Types.ObjectId;
  showTime: string;
  label: string;
  row: string;
  col: number;
  tier: 'VIP' | 'PREMIUM' | 'EXECUTIVE';
  price: number;
  status: 'AVAILABLE' | 'LOCKED' | 'BOOKED';
  lockedBy?: mongoose.Types.ObjectId;
  lockExpiresAt?: Date;
  bookingId?: mongoose.Types.ObjectId;
}

const SeatSchema = new Schema<ISeat>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    showTime: { type: String, required: true, default: '10:30 AM', index: true },
    label: { type: String, required: true },
    row: { type: String, required: true },
    col: { type: Number, required: true },
    tier: { type: String, enum: ['VIP', 'PREMIUM', 'EXECUTIVE'], default: 'PREMIUM' },
    price: { type: Number, required: true },
    status: { type: String, enum: ['AVAILABLE', 'LOCKED', 'BOOKED'], default: 'AVAILABLE', index: true },
    lockedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    lockExpiresAt: { type: Date, default: null, index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', default: null }
  },
  { timestamps: true }
);

// Compound index to guarantee uniqueness of seats per event and showtime
SeatSchema.index({ eventId: 1, showTime: 1, label: 1 }, { unique: true });

export const Seat = mongoose.model<ISeat>('Seat', SeatSchema);
