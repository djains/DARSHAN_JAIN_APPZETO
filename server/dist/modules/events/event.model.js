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
exports.Event = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const EventSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    emoji: { type: String, default: '🎬' },
    genre: { type: String, required: true, default: 'Action · Thriller' },
    languages: { type: [String], default: ['Hindi', 'English'] },
    rating: { type: String, default: '8.5' },
    certification: { type: String, default: 'UA' },
    price: { type: Number, required: true, default: 250 },
    durationMinutes: { type: Number, default: 150 },
    showTimes: { type: [String], default: ['10:30 AM', '02:15 PM', '06:00 PM', '09:30 PM'] },
    venue: { type: String, required: true, default: 'PVR Inox, Phoenix Mall' },
    status: { type: String, enum: ['DRAFT', 'PUBLISHED'], default: 'PUBLISHED' },
    lockDurationMinutes: { type: Number, default: 10 },
    totalRows: { type: Number, default: 6 },
    seatsPerRow: { type: Number, default: 8 }
}, { timestamps: true });
exports.Event = mongoose_1.default.model('Event', EventSchema);
