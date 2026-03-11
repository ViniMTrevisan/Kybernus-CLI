/**
 * Global teardown for integration tests.
 * Runs once after all test suites complete in the integration config.
 * Closes the Redis connection to allow the process to exit cleanly.
 */
import Redis from 'ioredis';

export default async function globalTeardown(): Promise<void> {
  const redisUrl = process.env['REDIS_URL'] ?? 'redis://localhost:6379';
  const client = new Redis(redisUrl, { lazyConnect: false, maxRetriesPerRequest: 1 });
  try {
    await client.quit();
  } catch {
    // ignore — redis may already be closed
  }
}
