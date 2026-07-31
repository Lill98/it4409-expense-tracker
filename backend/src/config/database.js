import mongoose from 'mongoose';

import { env } from './env.js';

/**
 * Opens the single shared Mongoose connection.
 * Called once from server.js before the HTTP server starts listening,
 * so the app never accepts traffic it cannot serve.
 */
export async function connectDatabase(uri = env.mongoUri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  return mongoose.connection;
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
