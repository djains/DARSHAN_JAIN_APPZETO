"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsController = void 0;
const bookings_service_1 = require("./bookings.service");
class BookingsController {
    static async create(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                return res.status(401).json({ error: { message: 'Unauthorized' } });
            const { eventId, seatIds, showTime } = req.body;
            const booking = await bookings_service_1.BookingsService.createBooking(userId, eventId, seatIds, showTime);
            res.status(201).json({ booking });
        }
        catch (err) {
            res.status(400).json({ error: { message: err.message } });
        }
    }
    static async payment(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                return res.status(401).json({ error: { message: 'Unauthorized' } });
            const bookingId = String(req.params.bookingId);
            const { paymentStatus } = req.body; // 'success' | 'failure'
            const booking = await bookings_service_1.BookingsService.processPayment(bookingId, userId, paymentStatus || 'success');
            res.json({ booking });
        }
        catch (err) {
            res.status(400).json({ error: { message: err.message } });
        }
    }
    static async myBookings(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                return res.status(401).json({ error: { message: 'Unauthorized' } });
            const bookings = await bookings_service_1.BookingsService.getUserBookings(userId);
            res.json({ bookings });
        }
        catch (err) {
            res.status(500).json({ error: { message: err.message } });
        }
    }
    static async cancel(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                return res.status(401).json({ error: { message: 'Unauthorized' } });
            const bookingId = String(req.params.bookingId);
            const booking = await bookings_service_1.BookingsService.cancelBooking(bookingId, userId);
            res.json({ booking, message: 'Booking cancelled successfully' });
        }
        catch (err) {
            res.status(400).json({ error: { message: err.message } });
        }
    }
    static async adminAllBookings(_req, res) {
        try {
            const bookings = await bookings_service_1.BookingsService.getAllBookingsForAdmin();
            res.json({ bookings });
        }
        catch (err) {
            res.status(500).json({ error: { message: err.message } });
        }
    }
}
exports.BookingsController = BookingsController;
