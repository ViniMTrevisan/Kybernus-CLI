import { createClient } from 'redis';

const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
});

client.on('error', (err) => console.error('Redis error:', err));
client.on('connect', () => console.log('✅ Redis connected'));

export async function connectRedis(): Promise<void> {
    await client.connect();
}

export { client as redis };
