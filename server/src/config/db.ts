import mongoose from 'mongoose';
import { env } from './env';

const LOCAL_FALLBACK_URI = 'mongodb://localhost:27017/ticket_booking';

export const connectDB = async (): Promise<void> => {
  mongoose.set('strictQuery', true);

  // Attempt Atlas Connection with TLS options
  try {
    console.log(`[MongoDB] Connecting to Atlas cluster...`);
    await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      tls: true,
      tlsAllowInvalidCertificates: true, // Fixes TLS alert 80 on Windows / OpenSSL
    });
    console.log(`[MongoDB] Connected successfully to MongoDB Atlas!`);
  } catch (error: any) {
    console.warn(`[MongoDB] Atlas SSL/TLS error: ${error?.message || error}`);
    console.warn(`[MongoDB] TIP: Check IP Whitelist (0.0.0.0/0) in MongoDB Atlas Network Access.`);
    console.log(`[MongoDB] Falling back to local MongoDB (${LOCAL_FALLBACK_URI})...`);
    
    try {
      await mongoose.connect(LOCAL_FALLBACK_URI, { serverSelectionTimeoutMS: 5000 });
      console.log(`[MongoDB] Connected successfully to local database fallback.`);
    } catch (fallbackError: any) {
      console.error('[MongoDB] Local fallback error:', fallbackError?.message);
      process.exit(1);
    }
  }

  // Ensure obsolete single-showtime index is dropped
  try {
    await mongoose.connection.collection('seats').dropIndex('eventId_1_label_1');
    console.log('[MongoDB] Cleaned up obsolete index eventId_1_label_1');
  } catch (_) {
    // Already dropped, ignore
  }
};
