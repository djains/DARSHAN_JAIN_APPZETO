"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const booking_model_1 = require("../bookings/booking.model");
const event_model_1 = require("../events/event.model");
const seat_model_1 = require("../events/seat.model");
const user_model_1 = require("../auth/user.model");
exports.analyticsRouter = (0, express_1.Router)();
exports.analyticsRouter.get('/stats', auth_1.authenticateToken, async (_req, res) => {
    try {
        const totalUsers = await user_model_1.User.countDocuments();
        const totalEvents = await event_model_1.Event.countDocuments();
        const totalBookings = await booking_model_1.Booking.countDocuments({ status: 'CONFIRMED' });
        const revenueAgg = await booking_model_1.Booking.aggregate([
            { $match: { status: 'CONFIRMED' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueAgg[0]?.total || 0;
        const totalSeats = await seat_model_1.Seat.countDocuments();
        const bookedSeats = await seat_model_1.Seat.countDocuments({ status: 'BOOKED' });
        const lockedSeats = await seat_model_1.Seat.countDocuments({ status: 'LOCKED' });
        res.json({
            stats: {
                totalUsers,
                totalEvents,
                totalBookings,
                totalRevenue,
                totalSeats,
                bookedSeats,
                lockedSeats,
                occupancyRate: totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0
            }
        });
    }
    catch (err) {
        res.status(500).json({ error: { message: err.message } });
    }
});
