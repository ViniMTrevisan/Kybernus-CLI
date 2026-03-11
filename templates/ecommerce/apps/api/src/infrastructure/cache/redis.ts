import Redis from 'ioredis';

// Prevent multiple Redis clients in development hot-reload
const globalForRedis = globalThis as unknown as { redis?: Redis };

export const redis =
  globalForRedis.redis ??
  new Redis(process.env['REDIS_URL'] ?? 'redis://localhost:6379', {
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
  });

if (process.env['NODE_ENV'] !== 'production') {
  globalForRedis.redis = redis;
}
