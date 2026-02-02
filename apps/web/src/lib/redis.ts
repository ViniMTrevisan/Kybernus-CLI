import { Redis } from '@upstash/redis';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Lazy initialization
let _redisClient: Redis | null = null;

// In-memory fallback rate limiter for when Redis is unavailable
const memoryRateLimiter = new Map<string, { count: number; resetAt: number }>();

// Cleanup old entries every 5 minutes to prevent memory leaks
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of memoryRateLimiter.entries()) {
        if (value.resetAt < now) {
            memoryRateLimiter.delete(key);
        }
    }
}, 5 * 60 * 1000);

function getRedis(): Redis | null {
    if (!redisUrl || !redisToken) {
        // Redis is optional - just skip caching/rate limiting if not configured
        return null;
    }
    if (!_redisClient) {
        _redisClient = new Redis({
            url: redisUrl,
            token: redisToken,
        });
    }
    return _redisClient;
}

/**
 * Rate limiter for API endpoints
 * Uses Redis when available, falls back to in-memory for critical paths
 */
export async function rateLimit(
    identifier: string,
    limit: number,
    windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
    const client = getRedis();

    // If Redis not configured, use in-memory fallback for security-critical paths
    if (!client) {
        const now = Date.now();
        const key = `rate:${identifier}`;
        const existing = memoryRateLimiter.get(key);

        if (!existing || existing.resetAt < now) {
            // Start new window
            memoryRateLimiter.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
            return { allowed: true, remaining: limit - 1, resetIn: windowSeconds };
        }

        existing.count++;
        const allowed = existing.count <= limit;
        return {
            allowed,
            remaining: Math.max(0, limit - existing.count),
            resetIn: Math.ceil((existing.resetAt - now) / 1000),
        };
    }

    try {
        const key = `rate:${identifier}`;
        const current = await client.incr(key);

        if (current === 1) {
            await client.expire(key, windowSeconds);
        }

        return {
            allowed: current <= limit,
            remaining: Math.max(0, limit - current),
            resetIn: windowSeconds,
        };
    } catch (error) {
        // On Redis error, use in-memory fallback instead of failing open
        console.error('[Redis] Rate limit error, using memory fallback:', error);
        const now = Date.now();
        const key = `rate:${identifier}`;
        const existing = memoryRateLimiter.get(key);

        if (!existing || existing.resetAt < now) {
            memoryRateLimiter.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
            return { allowed: true, remaining: limit - 1, resetIn: windowSeconds };
        }

        existing.count++;
        return {
            allowed: existing.count <= limit,
            remaining: Math.max(0, limit - existing.count),
            resetIn: Math.ceil((existing.resetAt - now) / 1000),
        };
    }
}

/**
 * Cache license validation results to reduce DB load
 */
export async function getCachedLicense(licenseKey: string): Promise<any | null> {
    const client = getRedis();
    if (!client) return null;

    try {
        const cached = await client.get(`license:${licenseKey}`);
        if (cached) {
            console.log('[Redis] License cache hit:', licenseKey.slice(0, 15));
            return typeof cached === 'string' ? JSON.parse(cached) : cached;
        }
        return null;
    } catch (error) {
        console.error('[Redis] Cache get error:', error);
        return null;
    }
}

export async function setCachedLicense(licenseKey: string, data: any, ttlSeconds: number = 300): Promise<void> {
    const client = getRedis();
    if (!client) return;

    try {
        await client.setex(`license:${licenseKey}`, ttlSeconds, JSON.stringify(data));
        console.log('[Redis] License cached:', licenseKey.slice(0, 15), `(TTL: ${ttlSeconds}s)`);
    } catch (error) {
        console.error('[Redis] Cache set error:', error);
    }
}

/**
 * Invalidate license cache (after upgrade, etc.)
 */
export async function invalidateLicenseCache(licenseKey: string): Promise<void> {
    const client = getRedis();
    if (!client) return;

    try {
        await client.del(`license:${licenseKey}`);
        console.log('[Redis] License cache invalidated:', licenseKey.slice(0, 15));
    } catch (error) {
        console.error('[Redis] Cache delete error:', error);
    }
}

export { getRedis };

// Export simplified redis interface for device flow
export const deviceRedis = {
    get: async (key: string) => {
        const client = getRedis();
        if (!client) return null;
        return client.get(key);
    },
    set: async (key: string, value: string, options?: { ex?: number }) => {
        const client = getRedis();
        if (!client) return;
        if (options?.ex) {
            await client.setex(key, options.ex, value);
        } else {
            await client.set(key, value);
        }
    },
    del: async (key: string) => {
        const client = getRedis();
        if (!client) return;
        await client.del(key);
    },
};
