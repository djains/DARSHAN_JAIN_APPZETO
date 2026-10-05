import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './modules/auth/auth.routes';
import { eventsRouter } from './modules/events/events.router';
import { seatsRouter } from './modules/seats/seats.router';
import { bookingsRouter } from './modules/bookings/bookings.router';
import { analyticsRouter } from './modules/analytics/analytics.router';

const app = express();

// Security middlewares
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many requests, slow down.' } },
});
app.use('/api', limiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRouter);
app.use('/api/seats', seatsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/analytics', analyticsRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// Global error handler
app.use(errorHandler);

export default app;
