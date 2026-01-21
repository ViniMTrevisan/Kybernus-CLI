import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        // Skip tests that require database connection (run locally only)
        exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/auth-flow.test.ts',
            '**/password-recovery.test.ts',
            '**/email-real.test.ts',
            '**/admin-protection.test.ts',
        ],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
