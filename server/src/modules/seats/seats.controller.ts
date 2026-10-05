import { Request, Response } from 'express';
import { SeatsService } from './seats.service';

export class SeatsController {
  static async lock(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

      const { eventId, seatIds, durationMinutes } = req.body;
      const lockedSeats = await SeatsService.lockSeats(userId, eventId, seatIds, durationMinutes);

      res.json({
        message: 'Seats locked successfully',
        seats: lockedSeats,
        lockExpiresAt: lockedSeats[0]?.lockExpiresAt
      });
    } catch (err: any) {
      res.status(400).json({ error: { message: err.message } });
    }
  }

  static async release(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

      const { seatIds } = req.body;
      await SeatsService.releaseSeats(userId, seatIds);
      res.json({ message: 'Seats released successfully' });
    } catch (err: any) {
      res.status(400).json({ error: { message: err.message } });
    }
  }
}
