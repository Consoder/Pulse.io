import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { redis } from '../src/config/redis.js';

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    await redis.quit(); // Close redis connection so jest can exit cleanly
});

afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany();
    }
    await redis.flushall(); // Clear cache between tests
});
