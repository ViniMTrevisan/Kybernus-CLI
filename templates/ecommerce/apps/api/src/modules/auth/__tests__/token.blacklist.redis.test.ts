/**
 * Integration tests for RedisTokenBlacklist.
 * Requires Redis running on REDIS_URL (defaults to redis://localhost:6379).
 * Run with: npm run test:db
 */
import Redis from 'ioredis';
import { RedisTokenBlacklist } from '../redis.token.blacklist';

const redisUrl = process.env['REDIS_URL'] ?? 'redis://localhost:6379';

describe('RedisTokenBlacklist', () => {
  let redis: Redis;
  let blacklist: RedisTokenBlacklist;

  beforeAll(async () => {
    redis = new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 3 });
    await redis.connect();
    blacklist = new RedisTokenBlacklist(redis);
  });

  afterAll(async () => {
    await redis.quit();
  });

  afterEach(async () => {
    // Clean up test keys
    const keys = await redis.keys('blacklist:test-*');
    if (keys.length > 0) await redis.del(...keys);
  });

  it('deve retornar false para jti desconhecido', async () => {
    const result = await blacklist.has('test-unknown-jti');
    expect(result).toBe(false);
  });

  it('deve persistir jti no Redis com TTL', async () => {
    const jti = 'test-jti-ttl';
    await blacklist.add(jti, 60);

    const ttl = await redis.ttl(`blacklist:${jti}`);
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(60);
  });

  it('deve retornar true após add()', async () => {
    const jti = 'test-jti-present';
    await blacklist.add(jti, 60);

    const result = await blacklist.has(jti);
    expect(result).toBe(true);
  });

  it('deve expirar automaticamente após TTL', async () => {
    const jti = 'test-jti-expire';
    await blacklist.add(jti, 1); // 1 second TTL

    const beforeExpiry = await blacklist.has(jti);
    expect(beforeExpiry).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const afterExpiry = await blacklist.has(jti);
    expect(afterExpiry).toBe(false);
  }, 5000);
});
