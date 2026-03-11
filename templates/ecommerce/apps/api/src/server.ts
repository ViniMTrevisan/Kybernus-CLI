import 'dotenv/config';
import app from './app';
import { prisma } from './shared/infra/prisma';

// ── Startup env validation ────────────────────────────────────────────────────
const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_RESET_SECRET',
  'STRIPE_SECRET_KEY',
];
const missing = REQUIRED_ENV_VARS.filter((v) => !process.env[v]);
if (missing.length > 0) {
  console.error(`[FATAL] Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const PORT = process.env['PORT'] ? parseInt(process.env['PORT'], 10) : 3000;

const server = app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
  console.log(`Environment: ${process.env['NODE_ENV'] ?? 'development'}`);
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
async function shutdown(signal: string): Promise<void> {
  console.log(`[${signal}] Shutting down gracefully…`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
    } catch {
      // ignore disconnect errors during shutdown
    }
    console.log('Server closed.');
    process.exit(0);
  });
  // Force exit if graceful shutdown takes too long
  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 30_000).unref();
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
