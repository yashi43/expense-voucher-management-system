const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expense_voucher_db';
  const useInMemory = process.env.USE_IN_MEMORY_DB === 'true';

  try {
    // Attempt connecting to specified MongoDB URI with a short timeout first if local
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: useInMemory ? 2500 : 10000,
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
  } catch (primaryErr) {
    if (useInMemory) {
      console.warn(`[MongoDB] Primary connection to ${mongoUri} failed (${primaryErr.message}). Starting MongoMemoryServer fallback...`);
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const memoryUri = mongod.getUri();
        const memConn = await mongoose.connect(memoryUri);
        console.log(`[MongoDB] In-memory database running at: ${memoryUri}`);
        return memConn;
      } catch (memErr) {
        console.error('[MongoDB] In-memory fallback failed:', memErr.message);
        throw memErr;
      }
    } else {
      console.error('[MongoDB] Connection error:', primaryErr.message);
      throw primaryErr;
    }
  }
};

module.exports = connectDB;
