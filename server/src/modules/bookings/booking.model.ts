import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  seats: mongoose.Types.ObjectId[];
  seatLabels: string[];
  totalAmount: number;
  showTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'CANCELLED' | 'EXPIRED';
  ticketCode: string;
  qrCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    seats: [{ type: Schema.Types.ObjectId, ref: 'Seat', required: true }],
    seatLabels: [{ type: String, required: true }],
    totalAmount: { type: Number, required: true },
    showTime: { type: String, required: true, default: '06:00 PM' },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'FAILED', 'CANCELLED', 'EXPIRED'],
      default: 'PENDING',
      index: true
    },
    ticketCode: { type: String, required: true, unique: true },
    qrCode: { type: String }
  },
  { timestamps: true }
);

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
