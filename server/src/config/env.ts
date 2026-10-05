import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  MONGO_URI: z.string().default('mongodb+srv://raonemortal_db_user:gXkjaa2miFK548Xh@cluster1.efwghbj.mongodb.net/ticket_booking?retryWrites=true&w=majority'),
  JWT_SECRET: z.string().default('supersecret_jwt_key_ticket_app_2026'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export const env = envSchema.parse(process.env);
