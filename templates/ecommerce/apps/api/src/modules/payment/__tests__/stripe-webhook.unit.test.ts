/**
 * StripeWebhookHandler — Unit Tests
 * Stripe SDK mocked; IOrderRepository mocked; ICouponRepository mocked.
 */

jest.mock('stripe');

import Stripe from 'stripe';
import { StripeWebhookHandler } from '../stripe-webhook.handler';
import { IOrderRepository } from '../../checkout/order.repository';
import { ICouponRepository } from '../../cart/coupon.repository';

const mockConstructEvent = jest.fn();

(Stripe as jest.MockedClass<typeof Stripe>).mockImplementation(() => ({
  webhooks: {
    constructEvent: mockConstructEvent,
  },
} as unknown as Stripe));

function makeOrderRepo(): jest.Mocked<IOrderRepository> {
  return {
    findById: jest.fn(),
    findByPaymentIntentId: jest.fn(),
    findByUserId: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  } as jest.Mocked<IOrderRepository>;
}

function makeCouponRepo(): jest.Mocked<ICouponRepository> {
  return {
    findByCode: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
    findAll: jest.fn(),
    deleteById: jest.fn(),
    incrementUsage: jest.fn(),
  } as jest.Mocked<ICouponRepository>;
}

function makeSucceededEvent(piId = 'pi_123') {
  return {
    id: `evt_${piId}`,
    type: 'payment_intent.succeeded',
    data: { object: { id: piId } as Stripe.PaymentIntent },
  } as Stripe.Event;
}

function makeFailedEvent(piId = 'pi_456') {
  return {
    id: `evt_${piId}`,
    type: 'payment_intent.payment_failed',
    data: { object: { id: piId } as Stripe.PaymentIntent },
  } as Stripe.Event;
}

describe('StripeWebhookHandler — Unit', () => {
  let orderRepo: jest.Mocked<IOrderRepository>;
  let couponRepo: jest.Mocked<ICouponRepository>;
  let handler: StripeWebhookHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    orderRepo = makeOrderRepo();
    couponRepo = makeCouponRepo();
    handler = new StripeWebhookHandler('sk_test_fake', 'whsec_fake', orderRepo, couponRepo);
  });

  it('deve processar evento payment_intent.succeeded e atualizar pedido para PAID', async () => {
    const event = makeSucceededEvent('pi_123');
    mockConstructEvent.mockReturnValue(event);

    const { OrderEntity } = await import('../../checkout/order.entity');
    const order = OrderEntity.create({
      userId: 'user-1',
      items: [{ id: 'item-1', variantId: 'v1', productId: 'p1', name: 'T-shirt', sku: 'TS-P', price: 99.9, qty: 1, image: null }],
      subtotal: 99.9,
      discount: 0,
      shippingCost: 18.5,
      tax: 0,
      total: 118.4,
      couponCode: null,
      paymentIntentId: 'pi_123',
      shippingAddress: null,
    });
    orderRepo.findByPaymentIntentId.mockResolvedValue(order);
    orderRepo.update.mockImplementation(async (o) => o);

    await handler.handleEvent(JSON.stringify({}), 'sig');

    expect(orderRepo.update).toHaveBeenCalled();
    const updated = orderRepo.update.mock.calls[0]![0];
    expect(updated.status).toBe('PAID');
  });

  it('deve processar evento payment_intent.payment_failed e atualizar pedido para FAILED', async () => {
    const event = makeFailedEvent('pi_456');
    mockConstructEvent.mockReturnValue(event);

    const { OrderEntity } = await import('../../checkout/order.entity');
    const order = OrderEntity.create({
      userId: 'user-1',
      items: [],
      subtotal: 50,
      discount: 0,
      shippingCost: 0,
      tax: 0,
      total: 50,
      couponCode: null,
      paymentIntentId: 'pi_456',
      shippingAddress: null,
    });
    orderRepo.findByPaymentIntentId.mockResolvedValue(order);
    orderRepo.update.mockImplementation(async (o) => o);

    await handler.handleEvent(JSON.stringify({}), 'sig');

    const updated = orderRepo.update.mock.calls[0]![0];
    expect(updated.status).toBe('FAILED');
  });

  it('deve rejeitar webhook com assinatura inválida (400)', async () => {
    mockConstructEvent.mockImplementation(() => {
      const err = new Error('No signatures found matching the expected signature');
      Object.assign(err, { type: 'StripeSignatureVerificationError' });
      throw err;
    });

    await expect(handler.handleEvent('{}', 'bad-sig')).rejects.toThrow('assinatura');
  });

  it('deve ser idempotente — processar o mesmo evento duas vezes não duplica ação', async () => {
    const event = makeSucceededEvent('pi_789');
    mockConstructEvent.mockReturnValue(event);

    const { OrderEntity } = await import('../../checkout/order.entity');
    const paid = OrderEntity.create({
      userId: 'u1', items: [], subtotal: 10, discount: 0, shippingCost: 0, tax: 0, total: 10,
      couponCode: null, paymentIntentId: 'pi_789', shippingAddress: null,
    }).pay();
    orderRepo.findByPaymentIntentId.mockResolvedValue(paid);

    await handler.handleEvent(JSON.stringify({}), 'sig');

    // Already PAID → update should NOT have been called again
    expect(orderRepo.update).not.toHaveBeenCalled();
  });

  it('deve ignorar eventos desconhecidos sem lançar erro', async () => {
    const event = { id: 'evt_x', type: 'customer.created', data: { object: {} } } as Stripe.Event;
    mockConstructEvent.mockReturnValue(event);

    await expect(handler.handleEvent(JSON.stringify({}), 'sig')).resolves.toBeUndefined();
    expect(orderRepo.update).not.toHaveBeenCalled();
  });
});

describe('StripeWebhookHandler — usageCount', () => {
  let orderRepo: jest.Mocked<IOrderRepository>;
  let couponRepo: jest.Mocked<ICouponRepository>;
  let handler: StripeWebhookHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    orderRepo = makeOrderRepo();
    couponRepo = makeCouponRepo();
    handler = new StripeWebhookHandler('sk_test_fake', 'whsec_fake', orderRepo, couponRepo);
  });

  it('incrementa usageCount do cupom quando payment_intent.succeeded e pedido tem couponCode', async () => {
    const event = makeSucceededEvent('pi_coupon1');
    mockConstructEvent.mockReturnValue(event);

    const { OrderEntity } = await import('../../checkout/order.entity');
    const order = OrderEntity.create({
      userId: 'u1',
      items: [],
      subtotal: 100,
      discount: 10,
      shippingCost: 0,
      tax: 0,
      total: 90,
      couponCode: 'PROMO10',
      paymentIntentId: 'pi_coupon1',
      shippingAddress: null,
    });
    orderRepo.findByPaymentIntentId.mockResolvedValue(order);
    orderRepo.update.mockImplementation(async (o) => o);
    couponRepo.incrementUsage.mockResolvedValue(undefined);

    await handler.handleEvent(JSON.stringify({}), 'sig');

    expect(couponRepo.incrementUsage).toHaveBeenCalledWith('PROMO10');
  });

  it('não falha se pedido não tiver cupom (couponCode null)', async () => {
    const event = makeSucceededEvent('pi_nocoupon');
    mockConstructEvent.mockReturnValue(event);

    const { OrderEntity } = await import('../../checkout/order.entity');
    const order = OrderEntity.create({
      userId: 'u1',
      items: [],
      subtotal: 50,
      discount: 0,
      shippingCost: 0,
      tax: 0,
      total: 50,
      couponCode: null,
      paymentIntentId: 'pi_nocoupon',
      shippingAddress: null,
    });
    orderRepo.findByPaymentIntentId.mockResolvedValue(order);
    orderRepo.update.mockImplementation(async (o) => o);

    await expect(handler.handleEvent(JSON.stringify({}), 'sig')).resolves.toBeUndefined();
    expect(couponRepo.incrementUsage).not.toHaveBeenCalled();
  });
});

// ── Phase 14 — Email transacional no webhook ─────────────────────────────────
import { IEmailService } from '../../../shared/infra/email/IEmailService';
import { IUserRepository } from '../../auth/user.repository';

function makeEmailService(): jest.Mocked<IEmailService> {
  return { send: jest.fn().mockResolvedValue(undefined) };
}

function makeUserRepo(): jest.Mocked<IUserRepository> {
  return {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
  } as jest.Mocked<IUserRepository>;
}

describe('StripeWebhookHandler — emails (Phase 14)', () => {
  let orderRepo: jest.Mocked<IOrderRepository>;
  let couponRepo: jest.Mocked<ICouponRepository>;
  let emailService: jest.Mocked<IEmailService>;
  let userRepo: jest.Mocked<IUserRepository>;
  let handler: StripeWebhookHandler;

  beforeEach(async () => {
    jest.clearAllMocks();
    orderRepo = makeOrderRepo();
    couponRepo = makeCouponRepo();
    emailService = makeEmailService();
    userRepo = makeUserRepo();
    handler = new StripeWebhookHandler(
      'sk_test_fake',
      'whsec_fake',
      orderRepo,
      couponRepo,
      emailService,
      userRepo,
    );
  });

  it('chama emailService.send() com subject "Pedido confirmado" em payment_intent.succeeded', async () => {
    const event = makeSucceededEvent('pi_email1');
    mockConstructEvent.mockReturnValue(event);

    const { OrderEntity } = await import('../../checkout/order.entity');
    const order = OrderEntity.create({
      userId: 'user-email-1',
      items: [{ id: 'i1', variantId: 'v1', productId: 'p1', name: 'Camiseta', sku: 'CAM-P', price: 99.9, qty: 2, image: null }],
      subtotal: 199.8,
      discount: 0,
      shippingCost: 15,
      tax: 0,
      total: 214.8,
      couponCode: null,
      paymentIntentId: 'pi_email1',
      shippingAddress: null,
    });
    orderRepo.findByPaymentIntentId.mockResolvedValue(order);
    orderRepo.update.mockImplementation(async (o) => o);

    const { UserEntity } = await import('../../auth/user.entity');
    const user = UserEntity.create({ name: 'Cliente', email: 'cliente@test.com', passwordHash: 'h', role: 'CUSTOMER' });
    userRepo.findById.mockResolvedValue(user);

    await handler.handleEvent(JSON.stringify({}), 'sig');

    expect(emailService.send).toHaveBeenCalledWith(
      'cliente@test.com',
      expect.stringContaining('confirmado'),
      expect.any(String),
    );
  });

  it('não falha se emailService.send() lançar (erro silencioso para não bloquear webhook)', async () => {
    const event = makeSucceededEvent('pi_email_err');
    mockConstructEvent.mockReturnValue(event);

    const { OrderEntity } = await import('../../checkout/order.entity');
    const order = OrderEntity.create({
      userId: 'user-email-2',
      items: [],
      subtotal: 50,
      discount: 0,
      shippingCost: 0,
      tax: 0,
      total: 50,
      couponCode: null,
      paymentIntentId: 'pi_email_err',
      shippingAddress: null,
    });
    orderRepo.findByPaymentIntentId.mockResolvedValue(order);
    orderRepo.update.mockImplementation(async (o) => o);

    const { UserEntity } = await import('../../auth/user.entity');
    const user = UserEntity.create({ name: 'Cliente', email: 'err@test.com', passwordHash: 'h', role: 'CUSTOMER' });
    userRepo.findById.mockResolvedValue(user);

    // email throws
    emailService.send.mockRejectedValue(new Error('SMTP down'));

    // handler must NOT throw
    await expect(handler.handleEvent(JSON.stringify({}), 'sig')).resolves.toBeUndefined();
    // order must still have been updated
    expect(orderRepo.update).toHaveBeenCalled();
  });
});
