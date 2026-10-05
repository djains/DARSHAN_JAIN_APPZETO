"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const events_service_1 = require("./modules/events/events.service");
const socket_1 = require("./socket");
const PORT = Number(env_1.env.PORT) || 5000;
const httpServer = (0, http_1.createServer)(app_1.default);
(0, socket_1.initSocket)(httpServer);
const start = async () => {
    await (0, db_1.connectDB)();
    await events_service_1.EventsService.seedDefaultsIfEmpty();
    httpServer.listen(PORT, () => {
        console.log(`[Server] Running in ${env_1.env.NODE_ENV} mode on http://localhost:${PORT}`);
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
