import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

// If we have a full URL (like from Upstash), use it.
// Otherwise, fall back to localhost settings.
export const redis = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
    : new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        maxRetriesPerRequest: null,
    });