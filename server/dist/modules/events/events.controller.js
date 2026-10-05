"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsController = void 0;
const events_service_1 = require("./events.service");
class EventsController {
    static async list(req, res) {
        try {
            const { search, genre, lang } = req.query;
            const events = await events_service_1.EventsService.getAllEvents({
                search: search,
                genre: genre,
                lang: lang
            });
            res.json({ events });
        }
        catch (err) {
            res.status(500).json({ error: { message: err.message || 'Failed to fetch events' } });
        }
    }
    static async getOne(req, res) {
        try {
            const eventId = String(req.params.id);
            const event = await events_service_1.EventsService.getEventById(eventId);
            if (!event) {
                return res.status(404).json({ error: { message: 'Movie event not found' } });
            }
            res.json({ event });
        }
        catch (err) {
            res.status(500).json({ error: { message: err.message } });
        }
    }
    static async getSeats(req, res) {
        try {
            const eventId = String(req.params.id);
            const showTime = req.query.showTime;
            const seats = await events_service_1.EventsService.getSeatsForEvent(eventId, showTime);
            res.json({ seats });
        }
        catch (err) {
            res.status(500).json({ error: { message: err.message } });
        }
    }
    static async create(req, res) {
        try {
            const event = await events_service_1.EventsService.createEvent(req.body);
            res.status(201).json({ event });
        }
        catch (err) {
            res.status(400).json({ error: { message: err.message } });
        }
    }
    static async delete(req, res) {
        try {
            const eventId = String(req.params.id);
            const success = await events_service_1.EventsService.deleteEvent(eventId);
            if (!success)
                return res.status(404).json({ error: { message: 'Event not found' } });
            res.json({ message: 'Event deleted successfully' });
        }
        catch (err) {
            res.status(500).json({ error: { message: err.message } });
        }
    }
}
exports.EventsController = EventsController;
