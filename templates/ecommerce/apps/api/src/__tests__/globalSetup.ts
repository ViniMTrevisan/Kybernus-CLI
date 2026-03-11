import { execSync } from 'child_process';
import path from 'path';

/**
 * Runs before all integration test workers.
 * - Ensures the test database exists
 * - Applies all pending Prisma migrations against TEST_DATABASE_URL
 */
export default async function globalSetup(): Promise<void> {
  const testDbUrl =
    process.env['TEST_DATABASE_URL'] ??
    'postgresql://ecommerce:ecommerce@localhost:5435/ecommerce_test';

  // __dirname = apps/api/src/__tests__ → two levels up = apps/api
  const apiRoot = path.resolve(__dirname, '../..');

  // Create test database if it doesn't exist (via docker exec)
  try {
    execSync(
      `docker exec ecommerce_postgres createdb -U ecommerce ecommerce_test`,
      { stdio: 'pipe', timeout: 10_000 },
    );
  } catch {
    // Likely "already exists" — not an error
  }

  // Apply migrations to the test database
  execSync('npx prisma migrate deploy', {
    cwd: apiRoot,
    env: { ...process.env, DATABASE_URL: testDbUrl },
    stdio: 'pipe',
    timeout: 60_000,
  });
}
