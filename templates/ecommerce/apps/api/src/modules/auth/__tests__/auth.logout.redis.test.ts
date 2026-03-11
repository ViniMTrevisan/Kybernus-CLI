/**
 * Redis-backed logout integration tests.
 * Verifies that JTIs are stored in Redis upon logout and that blacklisted
 * tokens are rejected by the /api/auth/refresh endpoint.
 *
 * Requires PostgreSQL + Redis running (docker-compose up).
 * Run with: npm run test:db
 */
import request from 'supertest';
import Redis from 'ioredis';
import app from '../../../app';

const REDIS_URL = process.env['REDIS_URL'] ?? 'redis://localhost:6379';

const USER = {
  name: 'Redis Logout User',
  email: 'redis.logout@email.com',
  password: 'senha1234',
};

describe('Auth Logout — Redis Integration', () => {
  let redis: Redis;

  beforeAll(async () => {
    redis = new Redis(REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 3 });
    await redis.connect();
    // Register user once for all tests
    await request(app).post('/api/auth/register').send(USER);
  });

  afterAll(async () => {
    // Clean up blacklist keys created during tests
    const keys = await redis.keys('blacklist:*');
    if (keys.length > 0) await redis.del(...keys);
    // Close the local client AND the shared registry Redis singleton
    const { redis: sharedRedis } = await import('../../../shared/infra/redis');
    await Promise.allSettled([redis.quit(), sharedRedis.quit()]);
  });

  it('deve adicionar jti do refreshToken ao Redis após logout', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: USER.email, password: USER.password });

    const cookies: string[] = loginRes.headers['set-cookie'] as unknown as string[];
    const cookieHeader = cookies.find((c) => c.startsWith('refreshToken=')) ?? '';
    const cookieValue = cookieHeader.split(';')[0] ?? '';

    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookieValue);

    expect(logoutRes.status).toBe(204);

    // At least one blacklist:* key should now exist in Redis
    const keys = await redis.keys('blacklist:*');
    expect(keys.length).toBeGreaterThan(0);
  });

  it('deve rejeitar refreshToken com jti na blacklist com 401', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: USER.email, password: USER.password });

    const cookies: string[] = loginRes.headers['set-cookie'] as unknown as string[];
    const cookieHeader = cookies.find((c) => c.startsWith('refreshToken=')) ?? '';
    const cookieValue = cookieHeader.split(';')[0] ?? '';

    // Logout — JTI enters Redis blacklist
    await request(app).post('/api/auth/logout').set('Cookie', cookieValue);

    // Re-use the same cookie → should be rejected
    const refreshRes = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', cookieValue);

    expect(refreshRes.status).toBe(401);
  });

  it('token de novo login deve ser aceito mesmo após logout do anterior', async () => {
    // First login + logout
    const firstLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: USER.email, password: USER.password });
    const firstCookies: string[] = firstLogin.headers['set-cookie'] as unknown as string[];
    const firstCookieHeader = firstCookies.find((c) => c.startsWith('refreshToken=')) ?? '';
    const firstCookieValue = firstCookieHeader.split(';')[0] ?? '';
    await request(app).post('/api/auth/logout').set('Cookie', firstCookieValue);

    // Second login — new JTI, should be accepted
    const secondLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: USER.email, password: USER.password });
    const secondCookies: string[] = secondLogin.headers['set-cookie'] as unknown as string[];
    const secondCookieHeader = secondCookies.find((c) => c.startsWith('refreshToken=')) ?? '';
    const secondCookieValue = secondCookieHeader.split(';')[0] ?? '';

    const refreshRes = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', secondCookieValue);

    expect(refreshRes.status).toBe(200);
  });
});
