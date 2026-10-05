"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastSeatUpdate = exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
let io = null;
const initSocket = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });
    io.on('connection', (socket) => {
        console.log(`[Socket.IO] Client connected: ${socket.id}`);
        socket.on('join:event', ({ eventId, showTime }) => {
            const room = `event:${eventId}:${showTime}`;
            socket.join(room);
            console.log(`[Socket.IO] Socket ${socket.id} joined room: ${room}`);
        });
        socket.on('leave:event', ({ eventId, showTime }) => {
            const room = `event:${eventId}:${showTime}`;
            socket.leave(room);
            console.log(`[Socket.IO] Socket ${socket.id} left room: ${room}`);
        });
        socket.on('disconnect', () => {
            console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO is not initialized!');
    }
    return io;
};
exports.getIO = getIO;
const broadcastSeatUpdate = (eventId, showTime, seatIds, status, userId) => {
    if (!io)
        return;
    const room = `event:${eventId}:${showTime}`;
    io.to(room).emit('seats:updated', {
        eventId,
        showTime,
        seatIds,
        status,
        userId,
        timestamp: new Date().toISOString()
    });
};
exports.broadcastSeatUpdate = broadcastSeatUpdate;
