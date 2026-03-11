import type { Config } from 'jest';

/**
 * Jest configuration for database integration tests.
 * Requires PostgreSQL running (docker-compose up postgres).
 *
 * Run with: npm run test:db
 */
const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  // Match Prisma repository and Redis integration tests
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.prisma.repository.test.ts',
    '<rootDir>/src/**/__tests__/**/*.redis.test.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'commonjs',
          moduleResolution: 'node',
          esModuleInterop: true,
        },
      },
    ],
  },
  // Runs once before all test workers: creates test DB + applies migrations
  globalSetup: '<rootDir>/src/__tests__/globalSetup.ts',
  // Runs once after all test workers finish: closes Redis connection
  globalTeardown: '<rootDir>/src/__tests__/globalTeardown.ts',
  // Runs in each worker: sets DATABASE_URL before any import
  setupFiles: ['<rootDir>/src/__tests__/setup.db.ts'],
  // Integration tests can be slower
  testTimeout: 30_000,
  clearMocks: true,
  restoreMocks: true,
};

export default config;
