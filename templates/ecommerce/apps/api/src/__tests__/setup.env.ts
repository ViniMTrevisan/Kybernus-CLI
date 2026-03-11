/**
 * Environment setup for API tests.
 * Runs before each test file in the worker process via jest `setupFiles`.
 * This ensures env vars are available before any module (including singletons
 * in auth.registry.ts) is first imported.
 *
 * Forces NODE_ENV=test-inmemory so the registry always uses InMemoryUserRepository
 * and InMemoryTokenBlacklist, regardless of DATABASE_URL or REDIS_URL present in
 * the developer's .env file. DB integration tests use their own setup (setup.db.ts).
 */
process.env['JWT_SECRET'] = process.env['JWT_SECRET'] ?? 'test-jwt-secret-min-32-chars-long!';
process.env['JWT_REFRESH_SECRET'] =
  process.env['JWT_REFRESH_SECRET'] ?? 'test-refresh-secret-min-32-chars-long!';
process.env['NODE_ENV'] = 'test-inmemory';
