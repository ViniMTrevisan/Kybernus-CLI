import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    // Inject VITE_STRIPE_PUBLIC_KEY into window.__STRIPE_KEY__ at build time.
    // This allows loadStripe() to read the key without import.meta.env (Jest-compatible).
    define: {
      'window.__STRIPE_KEY__': JSON.stringify(env['VITE_STRIPE_PUBLIC_KEY'] ?? ''),
    },
    server: {
      port: 5174,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
  };
});
