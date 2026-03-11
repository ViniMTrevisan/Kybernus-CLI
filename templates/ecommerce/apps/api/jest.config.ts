import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.ts'],
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
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  clearMocks: true,
  restoreMocks: true,
  setupFiles: ['<rootDir>/src/__tests__/setup.env.ts'],
  // Exclude DB integration tests — run those with `npm run test:db`
  // Exclude Ethereal email test — requires live network to smtp.ethereal.email
  testPathIgnorePatterns: [
    '/node_modules/',
    '\.prisma\.repository\.test\.ts$',
    '\.redis\.test\.ts$',
    'ethereal\.email\.integration\.test\.ts$',
  ],
};

export default config;
