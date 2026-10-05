import { Router } from 'express';
import { BookingsController } from './bookings.controller';
import { authenticateToken } from '../../middleware/auth';

export const bookingsRouter = Router();

bookingsRouter.get('/my', authenticateToken, BookingsController.myBookings);
bookingsRouter.post('/', authenticateToken, BookingsController.create);
bookingsRouter.post('/:bookingId/payment', authenticateToken, BookingsController.payment);
bookingsRouter.post('/:bookingId/cancel', authenticateToken, BookingsController.cancel);
bookingsRouter.get('/admin/all', authenticateToken, BookingsController.adminAllBookings);
