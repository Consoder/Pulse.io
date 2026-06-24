import { redis } from './src/config/redis.js';

async function flush() {
  console.log("Flushing Redis to clear queue backlog...");
  await redis.flushall();
  console.log("Redis flushed successfully!");
  process.exit(0);
}

flush();
