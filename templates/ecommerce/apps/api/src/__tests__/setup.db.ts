/**
 * Runs inside each integration test worker process (via `setupFiles`).
 * Sets DATABASE_URL to the test database before any module is imported.
 */
process.env['JWT_SECRET'] =
  process.env['JWT_SECRET'] ?? 'test-jwt-secret-min-32-chars-long!';
process.env['JWT_REFRESH_SECRET'] =
  process.env['JWT_REFRESH_SECRET'] ?? 'test-refresh-secret-min-32-chars-long!';
process.env['NODE_ENV'] = 'test';

// Point PrismaClient to the test database
const testDbUrl =
  process.env['TEST_DATABASE_URL'] ??
  'postgresql://ecommerce:ecommerce@localhost:5435/ecommerce_test';
process.env['DATABASE_URL'] = testDbUrl;

// Point Redis client to the test Redis instance
process.env['REDIS_URL'] = process.env['REDIS_URL'] ?? 'redis://localhost:6379';
