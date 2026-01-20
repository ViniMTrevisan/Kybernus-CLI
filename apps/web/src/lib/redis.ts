import { Redis } from '@upstash/redis';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Lazy initialization
let redis: Redis | null = null;

function getRedis(): Redis | null {
    if (!redisUrl || !redisToken) {
        // Redis is optional - just skip caching/rate limiting if not configured
        return null;
    }
    if (!redis) {
        redis = new Redis({
            url: redisUrl,
            token: redisToken,
        });
    }
    return redis;
}

/**
 * Rate limiter for API endpoints
 * Only applied to external/CLI endpoints to prevent abuse
 * Website endpoints are NOT rate limited for better UX
 */
export async function rateLimit(
    identifier: string,
    limit: number,
    windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
    const client = getRedis();

    // If Redis not configured, always allow (no rate limiting)
    if (!client) {
        return { allowed: true, remaining: limit, resetIn: 0 };
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
        // On Redis error, allow request (fail open)
        console.error('[Redis] Rate limit error:', error);
        return { allowed: true, remaining: limit, resetIn: 0 };
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
