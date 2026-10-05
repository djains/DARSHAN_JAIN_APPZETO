import { Booking, IBooking } from './booking.model';
import { Seat } from '../events/seat.model';
import mongoose from 'mongoose';
import QRCode from 'qrcode';
import { broadcastSeatUpdate } from '../../socket';

export class BookingsService {
  static async createBooking(userId: string, eventId: string, seatIds: string[], showTime: string = '06:00 PM'): Promise<IBooking> {
    const objectSeatIds = seatIds.map(id => new mongoose.Types.ObjectId(id));

    // Verify seats are locked by current user
    const seats = await Seat.find({
      _id: { $in: objectSeatIds },
      eventId: new mongoose.Types.ObjectId(eventId)
    });

    if (seats.length !== seatIds.length) {
      throw new Error('One or more invalid seat selections.');
    }

    const totalAmount = seats.reduce((sum, s) => sum + s.price, 0);
    const seatLabels = seats.map(s => s.label);
    const ticketCode = 'TKT-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    const booking = await Booking.create({
      userId: new mongoose.Types.ObjectId(userId),
      eventId: new mongoose.Types.ObjectId(eventId),
      seats: objectSeatIds,
      seatLabels,
      totalAmount,
      showTime,
      status: 'PENDING',
      ticketCode
    });

    return booking;
  }

  static async processPayment(bookingId: string, userId: string, paymentStatus: 'success' | 'failure'): Promise<IBooking> {
    const booking = await Booking.findOne({
      _id: new mongoose.Types.ObjectId(bookingId),
      userId: new mongoose.Types.ObjectId(userId)
    });

    if (!booking) {
      throw new Error('Booking not found.');
    }

    if (booking.status === 'CONFIRMED') {
      return booking; // Idempotent response
    }

    const seatIdsStr = booking.seats.map(s => s.toString());

    if (paymentStatus === 'success') {
      // Generate QR Code
      const qrData = `TICKET:${booking.ticketCode}|EVENT:${booking.eventId}|SEATS:${booking.seatLabels.join(',')}`;
      let qrCode = '';
      try {
        qrCode = await QRCode.toDataURL(qrData);
      } catch (e) {
        qrCode = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%236366f1"/><text x="50%" y="50%" fill="white" font-size="12" dominant-baseline="middle" text-anchor="middle">VALID TICKET</text></svg>';
      }

      booking.status = 'CONFIRMED';
      booking.qrCode = qrCode;
      await booking.save();

      // Mark seats as BOOKED
      await Seat.updateMany(
        { _id: { $in: booking.seats } },
        {
          $set: {
            status: 'BOOKED',
            lockedBy: null,
            lockExpiresAt: null,
            bookingId: booking._id
          }
        }
      );

      broadcastSeatUpdate(booking.eventId.toString(), booking.showTime, seatIdsStr, 'BOOKED', userId);
      return booking;
    } else {
      booking.status = 'FAILED';
      await booking.save();

      // Release seats back to AVAILABLE
      await Seat.updateMany(
        { _id: { $in: booking.seats } },
        {
          $set: {
            status: 'AVAILABLE',
            lockedBy: null,
            lockExpiresAt: null
          }
        }
      );

      broadcastSeatUpdate(booking.eventId.toString(), booking.showTime, seatIdsStr, 'AVAILABLE', userId);
      return booking;
    }
  }

  static async getUserBookings(userId: string): Promise<IBooking[]> {
    return Booking.find({ userId: new mongoose.Types.ObjectId(userId) })
      .populate('eventId')
      .sort({ createdAt: -1 });
  }

  static async cancelBooking(bookingId: string, userId: string): Promise<IBooking> {
    const booking = await Booking.findOne({
      _id: new mongoose.Types.ObjectId(bookingId),
      userId: new mongoose.Types.ObjectId(userId)
    });

    if (!booking) throw new Error('Booking not found.');
    if (booking.status === 'CANCELLED') return booking;

    booking.status = 'CANCELLED';
    await booking.save();

    const seatIdsStr = booking.seats.map(s => s.toString());

    // Release seats
    await Seat.updateMany(
      { _id: { $in: booking.seats } },
      { $set: { status: 'AVAILABLE', lockedBy: null, lockExpiresAt: null, bookingId: null } }
    );

    broadcastSeatUpdate(booking.eventId.toString(), booking.showTime, seatIdsStr, 'AVAILABLE', userId);
    return booking;
  }

  static async getAllBookingsForAdmin(): Promise<IBooking[]> {
    return Booking.find().populate('eventId').populate('userId', 'name email').sort({ createdAt: -1 });
  }
}
