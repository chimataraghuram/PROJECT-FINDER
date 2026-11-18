import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  if (!process.env.MONGODB_URI && process.env.NODE_ENV === 'production') {
    console.warn('MongoDB Warning: MONGODB_URI is not set in production. Running in resilient mode.');
    mongoose.set('bufferCommands', false);
    return;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/project-finder', {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`MongoDB Connection Warning: ${error.message} (continuing in resilient proxy mode)`);
    // Prevent unhandled buffering timeouts when MongoDB is offline
    mongoose.set('bufferCommands', false);
  }
};

export default connectDB;
