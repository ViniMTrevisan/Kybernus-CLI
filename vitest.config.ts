import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        // Skip tests that need live server or are run from apps/web
        exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/integration/**', '**/apps/web/**']
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './apps/web/src'),
        },
    },
});
