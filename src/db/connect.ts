import mongoose, { type Connection } from 'mongoose';
import config from '../config/index.js';

async function connectDB(): Promise<Connection> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongoUri);
  console.log(`[db] connected to MongoDB at ${config.mongoUri}`);
  return mongoose.connection;
}

export default connectDB;
