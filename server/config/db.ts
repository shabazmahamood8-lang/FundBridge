import mongoose from 'mongoose';

export let isConnectedToMongo = false;

export async function connectDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('[Database] MONGODB_URI not provided. Running in resilient In-Memory Store mode with full Mongoose schema compatibility.');
    return false;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnectedToMongo = true;
    console.log('[Database] Successfully connected to MongoDB Atlas / Instance.');
    return true;
  } catch (error) {
    console.warn('[Database] Failed to connect to MongoDB, falling back to In-Memory store:', (error as Error).message);
    isConnectedToMongo = false;
    return false;
  }
}
