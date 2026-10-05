"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('5000'),
    MONGO_URI: zod_1.z.string().default('mongodb+srv://raonemortal_db_user:gXkjaa2miFK548Xh@cluster1.efwghbj.mongodb.net/ticket_booking?retryWrites=true&w=majority'),
    JWT_SECRET: zod_1.z.string().default('supersecret_jwt_key_ticket_app_2026'),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
});
exports.env = envSchema.parse(process.env);
