import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { Booking } from '../bookings/booking.model';
import { Event } from '../events/event.model';
import { Seat } from '../events/seat.model';
import { User } from '../auth/user.model';

export const analyticsRouter = Router();

analyticsRouter.get('/stats', authenticateToken, async (_req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalBookings = await Booking.countDocuments({ status: 'CONFIRMED' });
    
    const revenueAgg = await Booking.aggregate([
      { $match: { status: 'CONFIRMED' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    const totalSeats = await Seat.countDocuments();
    const bookedSeats = await Seat.countDocuments({ status: 'BOOKED' });
    const lockedSeats = await Seat.countDocuments({ status: 'LOCKED' });

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
  } catch (err: any) {
    res.status(500).json({ error: { message: err.message } });
  }
});
