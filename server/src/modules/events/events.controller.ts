import { Request, Response } from 'express';
import { EventsService } from './events.service';

export class EventsController {
  static async list(req: Request, res: Response) {
    try {
      const { search, genre, lang } = req.query;
      const events = await EventsService.getAllEvents({
        search: search as string | undefined,
        genre: genre as string | undefined,
        lang: lang as string | undefined
      });
      res.json({ events });
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message || 'Failed to fetch events' } });
    }
  }

  static async getOne(req: Request, res: Response) {
    try {
      const eventId = String(req.params.id);
      const event = await EventsService.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ error: { message: 'Movie event not found' } });
      }
      res.json({ event });
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  }

  static async getSeats(req: Request, res: Response) {
    try {
      const eventId = String(req.params.id);
      const showTime = req.query.showTime as string | undefined;
      const seats = await EventsService.getSeatsForEvent(eventId, showTime);
      res.json({ seats });
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const event = await EventsService.createEvent(req.body);
      res.status(201).json({ event });
    } catch (err: any) {
      res.status(400).json({ error: { message: err.message } });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const eventId = String(req.params.id);
      const success = await EventsService.deleteEvent(eventId);
      if (!success) return res.status(404).json({ error: { message: 'Event not found' } });
      res.json({ message: 'Event deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  }
}
