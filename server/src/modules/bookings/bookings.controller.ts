import { Request, Response } from 'express';
import { BookingsService } from './bookings.service';

export class BookingsController {
  static async create(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

      const { eventId, seatIds, showTime } = req.body;
      const booking = await BookingsService.createBooking(userId, eventId, seatIds, showTime);
      res.status(201).json({ booking });
    } catch (err: any) {
      res.status(400).json({ error: { message: err.message } });
    }
  }

  static async payment(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

      const bookingId = String(req.params.bookingId);
      const { paymentStatus } = req.body; // 'success' | 'failure'

      const booking = await BookingsService.processPayment(bookingId, userId, paymentStatus || 'success');
      res.json({ booking });
    } catch (err: any) {
      res.status(400).json({ error: { message: err.message } });
    }
  }

  static async myBookings(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

      const bookings = await BookingsService.getUserBookings(userId);
      res.json({ bookings });
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  }

  static async cancel(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

      const bookingId = String(req.params.bookingId);
      const booking = await BookingsService.cancelBooking(bookingId, userId);
      res.json({ booking, message: 'Booking cancelled successfully' });
    } catch (err: any) {
      res.status(400).json({ error: { message: err.message } });
    }
  }

  static async adminAllBookings(_req: Request, res: Response) {
    try {
      const bookings = await BookingsService.getAllBookingsForAdmin();
      res.json({ bookings });
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  }
}
