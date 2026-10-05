import { Seat } from '../events/seat.model';
import mongoose from 'mongoose';
import { broadcastSeatUpdate } from '../../socket';

export class SeatsService {
  static async lockSeats(userId: string, eventId: string, seatIds: string[], durationMinutes: number = 10): Promise<any[]> {
    if (!seatIds || seatIds.length === 0) {
      throw new Error('No seats provided for locking.');
    }
    if (seatIds.length > 6) {
      throw new Error('Maximum 6 seats can be locked per transaction.');
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000);
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const objectSeatIds = seatIds.map(id => new mongoose.Types.ObjectId(id));

    // Atomic update: only update if seat is AVAILABLE OR its existing lock is expired, or already locked by this user
    const result = await Seat.updateMany(
      {
        _id: { $in: objectSeatIds },
        $or: [
          { status: 'AVAILABLE' },
          { status: 'LOCKED', lockExpiresAt: { $lt: now } },
          { status: 'LOCKED', lockedBy: userObjectId }
        ]
      },
      {
        $set: {
          status: 'LOCKED',
          lockedBy: userObjectId,
          lockExpiresAt: expiresAt
        }
      }
    );

    // If any requested seat was already locked by someone else or booked:
    if (result.modifiedCount < seatIds.length && result.matchedCount < seatIds.length) {
      // Rollback any seats that might have been partially updated
      await Seat.updateMany(
        { _id: { $in: objectSeatIds }, lockedBy: userObjectId, status: 'LOCKED', lockExpiresAt: expiresAt },
        { $set: { status: 'AVAILABLE', lockedBy: null, lockExpiresAt: null } }
      );
      throw new Error('Some of your selected seats are already locked by another user. Please choose available green seats.');
    }

    const lockedSeats = await Seat.find({ _id: { $in: objectSeatIds } });
    if (lockedSeats.length > 0) {
      const showTime = lockedSeats[0].showTime || '10:30 AM';
      broadcastSeatUpdate(eventId, showTime, seatIds, 'LOCKED', userId);
    }

    return lockedSeats;
  }

  static async releaseSeats(userId: string, seatIds: string[]): Promise<void> {
    const objectSeatIds = seatIds.map(id => new mongoose.Types.ObjectId(id));
    const seats = await Seat.find({ _id: { $in: objectSeatIds } });
    
    await Seat.updateMany(
      { _id: { $in: objectSeatIds }, lockedBy: new mongoose.Types.ObjectId(userId), status: 'LOCKED' },
      { $set: { status: 'AVAILABLE', lockedBy: null, lockExpiresAt: null } }
    );

    if (seats.length > 0) {
      const eventId = seats[0].eventId.toString();
      const showTime = seats[0].showTime || '10:30 AM';
      broadcastSeatUpdate(eventId, showTime, seatIds, 'AVAILABLE', userId);
    }
  }
}
