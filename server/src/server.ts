import { createServer } from 'http';
import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { EventsService } from './modules/events/events.service';
import { initSocket } from './socket';

const PORT = Number(env.PORT) || 5000;

const httpServer = createServer(app);
initSocket(httpServer);

const start = async () => {
  await connectDB();
  await EventsService.seedDefaultsIfEmpty();

  httpServer.listen(PORT, () => {
    console.log(`[Server] Running in ${env.NODE_ENV} mode on http://localhost:${PORT}`);
    console.log(`[Socket.IO] Real-time engine ready.`);
  });
};

// Graceful shutdown
const shutdown = () => {
  console.log('[Server] Graceful shutdown initiated...');
  httpServer.close(() => {
    console.log('[Server] HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
