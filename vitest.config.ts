import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        // Skip E2E tests by default (they require the server to be running)
        exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**']
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './apps/web/src'),
        },
    },
});
