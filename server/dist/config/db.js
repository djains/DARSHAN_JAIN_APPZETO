"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const LOCAL_FALLBACK_URI = 'mongodb://localhost:27017/ticket_booking';
const connectDB = async () => {
    mongoose_1.default.set('strictQuery', true);
    // Attempt Atlas Connection with TLS options
    try {
        console.log(`[MongoDB] Connecting to Atlas cluster...`);
        await mongoose_1.default.connect(env_1.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            tls: true,
            tlsAllowInvalidCertificates: true, // Fixes TLS alert 80 on Windows / OpenSSL
        });
        console.log(`[MongoDB] Connected successfully to MongoDB Atlas!`);
    }
    catch (error) {
        console.warn(`[MongoDB] Atlas SSL/TLS error: ${error?.message || error}`);
        console.warn(`[MongoDB] TIP: Check IP Whitelist (0.0.0.0/0) in MongoDB Atlas Network Access.`);
        console.log(`[MongoDB] Falling back to local MongoDB (${LOCAL_FALLBACK_URI})...`);
        try {
            await mongoose_1.default.connect(LOCAL_FALLBACK_URI, { serverSelectionTimeoutMS: 5000 });
            console.log(`[MongoDB] Connected successfully to local database fallback.`);
        }
        catch (fallbackError) {
            console.error('[MongoDB] Local fallback error:', fallbackError?.message);
            process.exit(1);
        }
    }
};
exports.connectDB = connectDB;
