"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeatsService = void 0;
const seat_model_1 = require("../events/seat.model");
const mongoose_1 = __importDefault(require("mongoose"));
const socket_1 = require("../../socket");
class SeatsService {
    static async lockSeats(userId, eventId, seatIds, durationMinutes = 10) {
        if (!seatIds || seatIds.length === 0) {
            throw new Error('No seats provided for locking.');
        }
        if (seatIds.length > 6) {
            throw new Error('Maximum 6 seats can be locked per transaction.');
        }
        const now = new Date();
        const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000);
        const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
        const objectSeatIds = seatIds.map(id => new mongoose_1.default.Types.ObjectId(id));
        // Atomic update: only update if seat is AVAILABLE OR its existing lock is expired, or already locked by this user
        const result = await seat_model_1.Seat.updateMany({
            _id: { $in: objectSeatIds },
            $or: [
                { status: 'AVAILABLE' },
                { status: 'LOCKED', lockExpiresAt: { $lt: now } },
                { status: 'LOCKED', lockedBy: userObjectId }
            ]
        }, {
            $set: {
                status: 'LOCKED',
                lockedBy: userObjectId,
                lockExpiresAt: expiresAt
            }
        });
        // If any requested seat was already locked by someone else or booked:
        if (result.modifiedCount < seatIds.length && result.matchedCount < seatIds.length) {
            // Rollback any seats that might have been partially updated
            await seat_model_1.Seat.updateMany({ _id: { $in: objectSeatIds }, lockedBy: userObjectId, status: 'LOCKED', lockExpiresAt: expiresAt }, { $set: { status: 'AVAILABLE', lockedBy: null, lockExpiresAt: null } });
            throw new Error('Some of your selected seats are already locked by another user. Please choose available green seats.');
        }
        const lockedSeats = await seat_model_1.Seat.find({ _id: { $in: objectSeatIds } });
        if (lockedSeats.length > 0) {
            const showTime = lockedSeats[0].showTime || '10:30 AM';
            (0, socket_1.broadcastSeatUpdate)(eventId, showTime, seatIds, 'LOCKED', userId);
        }
        return lockedSeats;
    }
    static async releaseSeats(userId, seatIds) {
        const objectSeatIds = seatIds.map(id => new mongoose_1.default.Types.ObjectId(id));
        const seats = await seat_model_1.Seat.find({ _id: { $in: objectSeatIds } });
        await seat_model_1.Seat.updateMany({ _id: { $in: objectSeatIds }, lockedBy: new mongoose_1.default.Types.ObjectId(userId), status: 'LOCKED' }, { $set: { status: 'AVAILABLE', lockedBy: null, lockExpiresAt: null } });
        if (seats.length > 0) {
            const eventId = seats[0].eventId.toString();
            const showTime = seats[0].showTime || '10:30 AM';
            (0, socket_1.broadcastSeatUpdate)(eventId, showTime, seatIds, 'AVAILABLE', userId);
        }
    }
}
exports.SeatsService = SeatsService;
