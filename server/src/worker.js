import { Worker } from 'bullmq';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Redis from 'ioredis'; // <--- THIS WAS MISSING
import { logger } from './utils/logger.js';

dotenv.config();

// Connect to DB independently
mongoose.connect(process.env.MONGO_URI)
    .then(() => logger.info('🔨 Worker DB Connected'))
    .catch(err => logger.error('Worker DB Error:', err));

// Define Analytics Schema here to avoid circular deps
const EventSchema = new mongoose.Schema({
    shortCode: String,
    timestamp: { type: Date, default: Date.now },
    meta: Object
}, { timeseries: { timeField: 'timestamp', granularity: 'seconds' } });

const Event = mongoose.model('Event', EventSchema);

// Create a connection configuration
const connection = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
    : { host: process.env.REDIS_HOST || 'localhost', port: process.env.REDIS_PORT || 6379 };

const worker = new Worker('analytics-queue', async (job) => {
    const { shortCode, ip, userAgent } = job.data;
    await Event.create({ shortCode, meta: { ip, userAgent } });
    logger.info(`🔨 Logged click for ${shortCode}`);
}, {
    connection: connection
});

worker.on('failed', (job, err) => {
    logger.error(`Job failed: ${err.message}`);
});