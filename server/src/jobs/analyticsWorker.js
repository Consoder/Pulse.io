import { Queue, Worker } from 'bullmq';
import { redis } from '../config/redis.js';
import { Link } from '../models/Link.js';

// Create the Queue
export const analyticsQueue = new Queue('analytics', { connection: redis });

// Create the Worker to process jobs in the background
const worker = new Worker('analytics', async (job) => {
    const { shortCode, analyticsData } = job.data;
    
    try {
        // Bulk update the database asynchronously
        await Link.findOneAndUpdate(
            { shortCode },
            { 
                $inc: { clicks: 1 },
                $push: { visitHistory: analyticsData }
            }
        );
        console.log(`✅ Processed analytics for: ${shortCode}`);
    } catch (err) {
        console.error(`❌ Failed to process analytics for ${shortCode}:`, err);
        throw err; // Let BullMQ handle retries
    }
}, { connection: redis });

worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed with error ${err.message}`);
});
