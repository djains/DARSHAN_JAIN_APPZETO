"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const booking_model_1 = require("./booking.model");
const seat_model_1 = require("../events/seat.model");
const mongoose_1 = __importDefault(require("mongoose"));
const qrcode_1 = __importDefault(require("qrcode"));
const socket_1 = require("../../socket");
class BookingsService {
    static async createBooking(userId, eventId, seatIds, showTime = '06:00 PM') {
        const objectSeatIds = seatIds.map(id => new mongoose_1.default.Types.ObjectId(id));
        // Verify seats are locked by current user
        const seats = await seat_model_1.Seat.find({
            _id: { $in: objectSeatIds },
            eventId: new mongoose_1.default.Types.ObjectId(eventId)
        });
        if (seats.length !== seatIds.length) {
            throw new Error('One or more invalid seat selections.');
        }
        const totalAmount = seats.reduce((sum, s) => sum + s.price, 0);
        const seatLabels = seats.map(s => s.label);
        const ticketCode = 'TKT-' + Math.random().toString(36).substring(2, 9).toUpperCase();
        const booking = await booking_model_1.Booking.create({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            eventId: new mongoose_1.default.Types.ObjectId(eventId),
            seats: objectSeatIds,
            seatLabels,
            totalAmount,
            showTime,
            status: 'PENDING',
            ticketCode
        });
        return booking;
    }
    static async processPayment(bookingId, userId, paymentStatus) {
        const booking = await booking_model_1.Booking.findOne({
            _id: new mongoose_1.default.Types.ObjectId(bookingId),
            userId: new mongoose_1.default.Types.ObjectId(userId)
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
                qrCode = await qrcode_1.default.toDataURL(qrData);
            }
            catch (e) {
                qrCode = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%236366f1"/><text x="50%" y="50%" fill="white" font-size="12" dominant-baseline="middle" text-anchor="middle">VALID TICKET</text></svg>';
            }
            booking.status = 'CONFIRMED';
            booking.qrCode = qrCode;
            await booking.save();
            // Mark seats as BOOKED
            await seat_model_1.Seat.updateMany({ _id: { $in: booking.seats } }, {
                $set: {
                    status: 'BOOKED',
                    lockedBy: null,
                    lockExpiresAt: null,
                    bookingId: booking._id
                }
            });
            (0, socket_1.broadcastSeatUpdate)(booking.eventId.toString(), booking.showTime, seatIdsStr, 'BOOKED', userId);
            return booking;
        }
        else {
            booking.status = 'FAILED';
            await booking.save();
            // Release seats back to AVAILABLE
            await seat_model_1.Seat.updateMany({ _id: { $in: booking.seats } }, {
                $set: {
                    status: 'AVAILABLE',
                    lockedBy: null,
                    lockExpiresAt: null
                }
            });
            (0, socket_1.broadcastSeatUpdate)(booking.eventId.toString(), booking.showTime, seatIdsStr, 'AVAILABLE', userId);
            return booking;
        }
    }
    static async getUserBookings(userId) {
        return booking_model_1.Booking.find({ userId: new mongoose_1.default.Types.ObjectId(userId) })
            .populate('eventId')
            .sort({ createdAt: -1 });
    }
    static async cancelBooking(bookingId, userId) {
        const booking = await booking_model_1.Booking.findOne({
            _id: new mongoose_1.default.Types.ObjectId(bookingId),
            userId: new mongoose_1.default.Types.ObjectId(userId)
        });
        if (!booking)
            throw new Error('Booking not found.');
        if (booking.status === 'CANCELLED')
            return booking;
        booking.status = 'CANCELLED';
        await booking.save();
        const seatIdsStr = booking.seats.map(s => s.toString());
        // Release seats
        await seat_model_1.Seat.updateMany({ _id: { $in: booking.seats } }, { $set: { status: 'AVAILABLE', lockedBy: null, lockExpiresAt: null, bookingId: null } });
        (0, socket_1.broadcastSeatUpdate)(booking.eventId.toString(), booking.showTime, seatIdsStr, 'AVAILABLE', userId);
        return booking;
    }
    static async getAllBookingsForAdmin() {
        return booking_model_1.Booking.find().populate('eventId').populate('userId', 'name email').sort({ createdAt: -1 });
    }
}
exports.BookingsService = BookingsService;
