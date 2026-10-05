"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeatsController = void 0;
const seats_service_1 = require("./seats.service");
class SeatsController {
    static async lock(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                return res.status(401).json({ error: { message: 'Unauthorized' } });
            const { eventId, seatIds, durationMinutes } = req.body;
            const lockedSeats = await seats_service_1.SeatsService.lockSeats(userId, eventId, seatIds, durationMinutes);
            res.json({
                message: 'Seats locked successfully',
                seats: lockedSeats,
                lockExpiresAt: lockedSeats[0]?.lockExpiresAt
            });
        }
        catch (err) {
            res.status(400).json({ error: { message: err.message } });
        }
    }
    static async release(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                return res.status(401).json({ error: { message: 'Unauthorized' } });
            const { seatIds } = req.body;
            await seats_service_1.SeatsService.releaseSeats(userId, seatIds);
            res.json({ message: 'Seats released successfully' });
        }
        catch (err) {
            res.status(400).json({ error: { message: err.message } });
        }
    }
}
exports.SeatsController = SeatsController;
