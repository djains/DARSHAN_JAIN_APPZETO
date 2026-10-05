"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Seat = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const SeatSchema = new mongoose_1.Schema({
    eventId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    showTime: { type: String, required: true, default: '10:30 AM', index: true },
    label: { type: String, required: true },
    row: { type: String, required: true },
    col: { type: Number, required: true },
    tier: { type: String, enum: ['VIP', 'PREMIUM', 'EXECUTIVE'], default: 'PREMIUM' },
    price: { type: Number, required: true },
    status: { type: String, enum: ['AVAILABLE', 'LOCKED', 'BOOKED'], default: 'AVAILABLE', index: true },
    lockedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', default: null },
    lockExpiresAt: { type: Date, default: null, index: true },
    bookingId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Booking', default: null }
}, { timestamps: true });
// Compound index to guarantee uniqueness of seats per event and showtime
SeatSchema.index({ eventId: 1, showTime: 1, label: 1 }, { unique: true });
exports.Seat = mongoose_1.default.model('Seat', SeatSchema);
