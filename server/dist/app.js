"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const errorHandler_1 = require("./middleware/errorHandler");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const events_router_1 = require("./modules/events/events.router");
const seats_router_1 = require("./modules/seats/seats.router");
const bookings_router_1 = require("./modules/bookings/bookings.router");
const analytics_router_1 = require("./modules/analytics/analytics.router");
const app = (0, express_1.default)();
// Security middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json({ limit: '10kb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
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
app.use('/api/auth', auth_routes_1.default);
app.use('/api/events', events_router_1.eventsRouter);
app.use('/api/seats', seats_router_1.seatsRouter);
app.use('/api/bookings', bookings_router_1.bookingsRouter);
app.use('/api/analytics', analytics_router_1.analyticsRouter);
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
});
// Global error handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
