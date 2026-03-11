import request from 'supertest';
import app from '../../../app';

/**
 * Checkout Routes — Integration Tests
 * Stripe is NOT called in tests — StripeAdapter is replaced with a mock
 * implementation via the checkout.registry singleton override.
 */

let customerToken: string;
let adminToken: string;
let productId: string;
let variantId: string;

const CUSTOMER = { name: 'Checkout Customer', email: 'checkout.c@test.com', password: 'pass1234' };
const ADMIN = { name: 'Checkout Admin', email: 'checkout.a@test.com', password: 'admin1234' };

beforeAll(async () => {
  await request(app).post('/api/auth/register').send(CUSTOMER);

  const { userRepository } = await import('../../auth/auth.registry');
  const { UserEntity } = await import('../../auth/user.entity');
  const { hash } = await import('bcryptjs');
  const adminEntity = UserEntity.create({
    name: ADMIN.name, email: ADMIN.email,
    passwordHash: await hash(ADMIN.password, 10), role: 'ADMIN',
  });
  await userRepository.create(adminEntity);

  const [cRes, aRes] = await Promise.all([
    request(app).post('/api/auth/login').send({ email: CUSTOMER.email, password: CUSTOMER.password }),
    request(app).post('/api/auth/login').send({ email: ADMIN.email, password: ADMIN.password }),
  ]);
  customerToken = (cRes.body as { accessToken: string }).accessToken;
  adminToken = (aRes.body as { accessToken: string }).accessToken;

  // Create product via API
  const { catalogRegistry } = await import('../../catalog/catalog.registry');
  const { CategoryEntity } = await import('../../catalog/category.entity');
  await catalogRegistry.categoryRepository.create(
    CategoryEntity.create({ name: 'Checkout Test', slug: 'checkout-test', description: null, parentId: null }),
  );

  const productRes = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: 'Produto Checkout',
      price: 100,
      categorySlug: 'checkout-test',
      images: [],
      variants: [{ sku: 'CHK-1', size: 'U', color: 'Azul', stock: 20 }],
    });
  const body = productRes.body as { id: string; variants: Array<{ id: string }> };
  productId = body.id;
  variantId = body.variants[0]!.id;

  // Override the payment adapter with a mock to avoid real Stripe calls
  const { checkoutRegistry } = await import('../checkout.registry');
  checkoutRegistry.paymentAdapter.createPaymentIntent = jest.fn().mockResolvedValue({
    id: 'pi_test_123',
    clientSecret: 'pi_test_123_secret',
  });
});

// ── POST /api/checkout ────────────────────────────────────────────────────────
describe('POST /api/checkout', () => {
  it('401: deve exigir autenticação', async () => {
    const res = await request(app).post('/api/checkout').send({});
    expect(res.status).toBe(401);
  });

  it('400: deve rejeitar carrinho vazio', async () => {
    const res = await request(app)
      .post('/api/checkout')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ shippingCost: 18.5, shippingAddress: null });
    expect(res.status).toBe(400);
  });

  it('201: deve criar pedido e retornar { orderId, clientSecret }', async () => {
    // Add item to cart first
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId, variantId, qty: 1 });

    const res = await request(app)
      .post('/api/checkout')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ shippingCost: 18.5, shippingAddress: { street: 'Rua das Flores, 100', city: 'São Paulo', zip: '01310-100' } });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('orderId');
    expect(res.body).toHaveProperty('clientSecret');
  });

  it('deve retornar 409 se estoque foi esgotado entre carrinho e checkout', async () => {
    // Put cart item back (previous test cleared cart)
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId, variantId, qty: 1 });

    // Exhaust stock directly via stock update API
    await request(app)
      .patch(`/api/products/${productId}/stock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ variantId, delta: -19 }); // bring stock to 0

    const res = await request(app)
      .post('/api/checkout')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ shippingCost: 0, shippingAddress: null });

    expect(res.status).toBe(409);

    // Restore stock
    await request(app)
      .patch(`/api/products/${productId}/stock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ variantId, delta: 19 });
  });
});

// ── POST /api/checkout/webhook ────────────────────────────────────────────────
describe('POST /api/checkout/webhook', () => {
  it('400: deve rejeitar webhook sem header stripe-signature', async () => {
    const res = await request(app)
      .post('/api/checkout/webhook')
      .send({ type: 'payment_intent.succeeded' });
    expect(res.status).toBe(400);
  });

  it('400: deve rejeitar webhook com assinatura inválida', async () => {
    // Override handler with one that throws on bad signature
    const { checkoutRegistry } = await import('../checkout.registry');
    const original = checkoutRegistry.webhookHandler.handleEvent.bind(checkoutRegistry.webhookHandler);
    checkoutRegistry.webhookHandler.handleEvent = jest.fn().mockRejectedValue(
      Object.assign(new Error('Assinatura inválida'), { statusCode: 400 }),
    );

    const res = await request(app)
      .post('/api/checkout/webhook')
      .set('stripe-signature', 'bad-sig')
      .send(JSON.stringify({ type: 'payment_intent.succeeded' }));

    expect(res.status).toBe(400);
    checkoutRegistry.webhookHandler.handleEvent = original;
  });

  it('200: deve processar payment_intent.succeeded com assinatura válida', async () => {
    const { checkoutRegistry } = await import('../checkout.registry');
    checkoutRegistry.webhookHandler.handleEvent = jest.fn().mockResolvedValue(undefined);

    const res = await request(app)
      .post('/api/checkout/webhook')
      .set('stripe-signature', 'valid-sig')
      .send(JSON.stringify({ type: 'payment_intent.succeeded' }));

    expect(res.status).toBe(200);
  });
});
