import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server | null = null;

export const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('join:event', ({ eventId, showTime }) => {
      if (eventId && showTime) {
        const room = `event:${eventId}:${showTime.trim()}`;
        socket.join(room);
        console.log(`[Socket.IO] Socket ${socket.id} joined room: ${room}`);
      }
    });

    socket.on('leave:event', ({ eventId, showTime }) => {
      if (eventId && showTime) {
        const room = `event:${eventId}:${showTime.trim()}`;
        socket.leave(room);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO is not initialized!');
  }
  return io;
};

export const broadcastSeatUpdate = (eventId: string, showTime: string, seatIds: string[], status: string, userId?: string) => {
  if (!io) return;
  const payload = {
    eventId: String(eventId),
    showTime: (showTime || '').trim(),
    seatIds: (seatIds || []).map(id => String(id)),
    status,
    userId: userId ? String(userId) : undefined,
    timestamp: new Date().toISOString()
  };

  const room = `event:${payload.eventId}:${payload.showTime}`;
  // Emit to specific room
  io.to(room).emit('seats:updated', payload);
  // Also emit globally so no client ever misses an update
  io.emit('seats:updated', payload);

  console.log(`[Socket.IO] Broadcasted seats:updated for ${payload.showTime}: ${seatIds.length} seat(s) -> ${status}`);
};
