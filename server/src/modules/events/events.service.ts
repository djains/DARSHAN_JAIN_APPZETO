import { Event, IEvent } from './event.model';
import { Seat } from './seat.model';
import mongoose from 'mongoose';
import { broadcastSeatUpdate } from '../../socket';

const DEFAULT_MOVIES: Array<Partial<IEvent>> = [
  {
    title: 'Pushpa 2: The Rule',
    emoji: '🔥',
    genre: 'Action · Thriller',
    description: 'The clash continues as Pushpa Raj rules the sandalwood smuggling empire. High-octane action and intense drama.',
    languages: ['Hindi', 'Telugu', 'Tamil'],
    rating: '9.1',
    certification: 'A',
    price: 249,
    durationMinutes: 180,
    showTimes: ['10:30 AM', '02:15 PM', '06:00 PM', '09:30 PM'],
    venue: 'PVR Inox, Phoenix Mall',
    totalRows: 6,
    seatsPerRow: 8,
    status: 'PUBLISHED'
  },
  {
    title: 'Stree 3',
    emoji: '👻',
    genre: 'Horror · Comedy',
    description: 'Chanderi faces a new mystical threat in this terrifying yet hilarious chapter of the supernatural saga.',
    languages: ['Hindi'],
    rating: '8.7',
    certification: 'UA',
    price: 199,
    durationMinutes: 140,
    showTimes: ['10:30 AM', '02:15 PM', '06:00 PM', '09:30 PM'],
    venue: 'Cinepolis, Grand Mall',
    totalRows: 6,
    seatsPerRow: 8,
    status: 'PUBLISHED'
  },
  {
    title: 'Kalki 2898 AD: Part 2',
    emoji: '⚡',
    genre: 'Sci-Fi · Action',
    description: 'A futuristic epic inspired by Indian mythology, following the journey of the avatar in a dystopian world.',
    languages: ['Hindi', 'Telugu'],
    rating: '8.4',
    certification: 'U',
    price: 299,
    durationMinutes: 175,
    showTimes: ['10:30 AM', '02:15 PM', '06:00 PM', '09:30 PM'],
    venue: 'IMAX 3D, Square Cinema',
    totalRows: 6,
    seatsPerRow: 8,
    status: 'PUBLISHED'
  },
  {
    title: 'Dune: Messiah',
    emoji: '🏜️',
    genre: 'Sci-Fi · Epic',
    description: 'Paul Atreides faces the complex political and religious consequences of his victory as Emperor of Arrakis.',
    languages: ['English', 'Hindi'],
    rating: '9.3',
    certification: 'U',
    price: 349,
    durationMinutes: 165,
    showTimes: ['10:30 AM', '02:15 PM', '06:00 PM', '09:30 PM'],
    venue: 'PVR Gold Class',
    totalRows: 6,
    seatsPerRow: 8,
    status: 'PUBLISHED'
  }
];

export class EventsService {
  static async seedDefaultsIfEmpty(): Promise<void> {
    // Purge old seats that lack showTime field
    await Seat.deleteMany({ showTime: { $exists: false } });

    const count = await Event.countDocuments();
    if (count === 0) {
      console.log('[Seed] Seeding initial movies into MongoDB...');
      for (const m of DEFAULT_MOVIES) {
        await this.createEvent(m);
      }
      console.log('[Seed] Initial movies and showtime seat maps successfully seeded!');
    }
  }

  static async createEvent(data: Partial<IEvent>): Promise<IEvent> {
    const event = await Event.create(data);
    const showTimes = event.showTimes?.length ? event.showTimes : ['10:30 AM', '02:15 PM', '06:00 PM', '09:30 PM'];
    
    // Auto-generate seat grid FOR EACH SHOWTIME
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].slice(0, data.totalRows || 6);
    const cols = data.seatsPerRow || 8;
    const seatsToInsert = [];

    for (const st of showTimes) {
      for (const r of rows) {
        for (let c = 1; c <= cols; c++) {
          let tier: 'VIP' | 'PREMIUM' | 'EXECUTIVE' = 'EXECUTIVE';
          let seatPrice = event.price;

          if (r === 'A' || r === 'B') {
            tier = 'VIP';
            seatPrice = Math.round(event.price * 1.4);
          } else if (r === 'C' || r === 'D') {
            tier = 'PREMIUM';
            seatPrice = Math.round(event.price * 1.2);
          }

          seatsToInsert.push({
            eventId: event._id,
            showTime: st,
            label: `${r}${c}`,
            row: r,
            col: c,
            tier,
            price: seatPrice,
            status: 'AVAILABLE'
          });
        }
      }
    }

    await Seat.insertMany(seatsToInsert);
    return event;
  }

  static async getAllEvents(queryFilter: { search?: string; genre?: string; lang?: string } = {}): Promise<IEvent[]> {
    const filter: any = { status: 'PUBLISHED' };
    if (queryFilter.genre && queryFilter.genre !== 'All') {
      filter.genre = { $regex: queryFilter.genre, $options: 'i' };
    }
    if (queryFilter.lang && queryFilter.lang !== 'All Languages') {
      filter.languages = queryFilter.lang;
    }
    if (queryFilter.search) {
      filter.title = { $regex: queryFilter.search, $options: 'i' };
    }
    return Event.find(filter).sort({ createdAt: -1 });
  }

  static async getEventById(id: string): Promise<IEvent | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Event.findById(id);
  }

  static async getSeatsForEvent(eventId: string, showTime?: string): Promise<any[]> {
    if (!mongoose.Types.ObjectId.isValid(eventId)) return [];
    const event = await Event.findById(eventId);
    if (!event) return [];

    const targetShowTime = showTime || event.showTimes?.[0] || '10:30 AM';
    const now = new Date();

    // Sweeper: Auto-release expired locks for this event & showtime
    await Seat.updateMany(
      {
        eventId: new mongoose.Types.ObjectId(eventId),
        showTime: targetShowTime,
        status: 'LOCKED',
        lockExpiresAt: { $lt: now }
      },
      {
        $set: { status: 'AVAILABLE', lockedBy: null, lockExpiresAt: null }
      }
    );

    // Fetch seats for this showTime
    let seats = await Seat.find({
      eventId: new mongoose.Types.ObjectId(eventId),
      showTime: targetShowTime
    }).sort({ row: 1, col: 1 });

    // Fallback: If no seats exist for this showtime, generate them on the fly
    if (seats.length === 0) {
      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].slice(0, event.totalRows || 6);
      const cols = event.seatsPerRow || 8;
      const seatsToInsert = [];

      for (const r of rows) {
        for (let c = 1; c <= cols; c++) {
          let tier: 'VIP' | 'PREMIUM' | 'EXECUTIVE' = 'EXECUTIVE';
          let seatPrice = event.price;

          if (r === 'A' || r === 'B') {
            tier = 'VIP';
            seatPrice = Math.round(event.price * 1.4);
          } else if (r === 'C' || r === 'D') {
            tier = 'PREMIUM';
            seatPrice = Math.round(event.price * 1.2);
          }

          seatsToInsert.push({
            eventId: event._id,
            showTime: targetShowTime,
            label: `${r}${c}`,
            row: r,
            col: c,
            tier,
            price: seatPrice,
            status: 'AVAILABLE'
          });
        }
      }

      await Seat.insertMany(seatsToInsert);
      seats = await Seat.find({
        eventId: new mongoose.Types.ObjectId(eventId),
        showTime: targetShowTime
      }).sort({ row: 1, col: 1 });
    }

    return seats;
  }

  static async deleteEvent(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    await Event.findByIdAndDelete(id);
    await Seat.deleteMany({ eventId: new mongoose.Types.ObjectId(id) });
    return true;
  }
}
