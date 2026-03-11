import { InMemoryOrderRepository } from '../../persistence/in-memory/order.memory.repository';
import { PrismaOrderRepository } from '../../persistence/prisma/checkout/order.prisma.repository';
import { StripeAdapter } from '../../services/payment/stripe.adapter';
import { StripeWebhookHandler } from '../../services/payment/stripe-webhook.handler';
import { CheckoutService } from '../../../application/checkout/checkout.service';
import { cartRepository, couponRepository } from './cart.registry';
import { productRepository } from './catalog.registry';
import { prisma } from '../../persistence/prisma-client';
import { emailService } from '../../services/email/email.registry';
import { userRepository } from './auth.registry';

const useDb =
  Boolean(process.env['DATABASE_URL']) &&
  process.env['NODE_ENV'] !== 'test-inmemory';

// ── Singletons ────────────────────────────────────────────────────────────────
export const orderRepository = useDb
  ? new PrismaOrderRepository(prisma)
  : new InMemoryOrderRepository();

export const paymentAdapter = new StripeAdapter(
  process.env['STRIPE_SECRET_KEY'] ?? 'sk_test_dummy',
);

export const webhookHandler = new StripeWebhookHandler(
  process.env['STRIPE_SECRET_KEY'] ?? 'sk_test_dummy',
  process.env['STRIPE_WEBHOOK_SECRET'] ?? 'whsec_dummy',
  orderRepository,
  couponRepository,
  emailService,
  userRepository,
);

export const checkoutService = new CheckoutService(
  orderRepository,
  paymentAdapter,
  cartRepository,
  productRepository,
);

// ── Named export for test overrides ──────────────────────────────────────────
export const checkoutRegistry = {
  orderRepository,
  paymentAdapter,
  webhookHandler,
  checkoutService,
};
