import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { errorHandler } from './shared/middlewares/errorHandler';
import { AppError } from './shared/errors/AppError';
import authRoutes from './modules/auth/auth.routes';
import catalogRoutes, { categoryRouter } from './modules/catalog/catalog.routes';
import cartRoutes from './modules/cart/cart.routes';
import checkoutRoutes from './modules/checkout/checkout.routes';
import { orderRoutes, adminOrderRoutes } from './modules/orders/order.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import profileRoutes from './modules/profile/profile.routes';
import { prisma } from './shared/infra/prisma';
import { redis } from './shared/infra/redis';

const app = express();

// ── Trust proxy (required when running behind a reverse proxy / load balancer)
// Rate limiting uses the real client IP from X-Forwarded-For instead of the
// proxy IP. Set to the number of trusted proxy hops (1 = one hop, e.g. nginx).
if (process.env['NODE_ENV'] === 'production') {
  app.set('trust proxy', 1);
}

// ── Stripe webhook MUST receive the raw body for signature verification.
// Register express.raw() for this path BEFORE express.json() runs globally,
// otherwise express.json() will parse the body first and the raw bytes are lost.
app.use('/api/checkout/webhook', express.raw({ type: 'application/json' }));

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ── Core middlewares ─────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env['CORS_ORIGIN'] || 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(cookieParser());

// ── Static file serving (product images) ────────────────────────────────────
// Serves LocalDiskStorageService uploads from apps/api/public/
app.use('/public', express.static(path.join(__dirname, '../public')));

// ── Rate limiting (disabled in test environment) ────────────────────────────
if (process.env['NODE_ENV'] !== 'test' && process.env['NODE_ENV'] !== 'test-inmemory') {
  const makeLimiter = (max: number, windowMs = 60_000) =>
    rateLimit({
      windowMs,
      max,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: 'Too many requests, please try again later.' },
    });

  // Auth: strict — brute-force protection
  const authLimiter = makeLimiter(20);
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
  app.use('/api/auth/forgot-password', authLimiter);
  app.use('/api/auth/reset-password', authLimiter);

  // Checkout: 10 requests/min — prevents order spam and payment intent abuse
  app.use('/api/checkout', makeLimiter(10));

  // Orders: 60 requests/min — prevents enumeration scraping
  app.use('/api/orders', makeLimiter(60));
  app.use('/api/admin/orders', makeLimiter(60));

  // Admin: 120 requests/min — still generous for legitimate use
  app.use('/api/admin', makeLimiter(120));
}

// ── Health check (liveness) ──────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// ── Readiness probe — checks DB + Redis ─────────────────────────────────────
app.get('/health/ready', async (_req: Request, res: Response) => {
  const checks: Record<string, string> = {};
  let ok = true;
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks['database'] = 'ok';
  } catch {
    checks['database'] = 'unreachable';
    ok = false;
  }
  try {
    await redis.ping();
    checks['redis'] = 'ok';
  } catch {
    checks['redis'] = 'unreachable';
    ok = false;
  }
  res.status(ok ? 200 : 503).json({ status: ok ? 'ok' : 'degraded', checks });
});

// ── Test-only route (throws intentionally to exercise the error handler) ─────
// Available in 'test' and 'development' — never in production
if (process.env['NODE_ENV'] !== 'production') {
  app.get('/test-error', (_req: Request, _res: Response, next: NextFunction) => {
    next(new Error('Intentional test error'));
  });
}

// ── Feature routes ────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);        // Phase 1 ✅
app.use('/api/products', catalogRoutes); // Phase 2 ✅
app.use('/api/categories', categoryRouter); // Phase 2 ✅
app.use('/api/cart', cartRoutes);        // Phase 3 ✅
app.use('/api/checkout', checkoutRoutes); // Phase 4 ✅
app.use('/api/orders', orderRoutes);      // Phase 5 ✅
app.use('/api/admin/orders', adminOrderRoutes); // Phase 5 ✅
app.use('/api/admin', adminRoutes);       // Phase 6 ✅
app.use('/api/me', profileRoutes);        // Phase 16 ✅

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError('Route not found', 404));
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
