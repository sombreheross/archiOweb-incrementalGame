import mongoose from 'mongoose';
import { cleanUpDatabase } from '../utils.js';

let connection;

beforeAll(async () => {
  // Connect to test database based on environment
  const dbUrl = process.env.NODE_ENV === 'test' 
    ? 'mongodb://127.0.0.1/automatedTestDB'
    : process.env.MONGODB_URI;
    
  connection = await mongoose.connect(dbUrl);
  console.log(`Connected to MongoDB (${process.env.NODE_ENV} environment)`);
  
  // Clean and initialize test database
  await cleanUpDatabase();
});

afterAll(async () => {
  if (connection) {
    await connection.disconnect();
    // Ensure all connections are closed
    await mongoose.connection.close();
    await mongoose.disconnect();
  }
  console.log('Disconnected from database');
}); 