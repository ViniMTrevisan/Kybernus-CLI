/**
 * Order Routes — Integration Tests (Phase 5)
 *
 * Customer routes:  GET /api/orders, GET /api/orders/:id
 * Admin routes:     GET /api/admin/orders, PATCH /api/admin/orders/:id/status
 */
import request from 'supertest';
import app from '../../../app';

let customerToken: string;
let adminToken: string;
let customerId: string;
let customerOrderId: string;
let paidOrderId: string;
let otherOrderId: string; // belongs to a different user

const CUSTOMER = { name: 'Order Customer', email: 'order.c@test.com', password: 'pass1234' };
const CUSTOMER2 = { name: 'Other User', email: 'order.other@test.com', password: 'pass1234' };
const ADMIN = { name: 'Order Admin', email: 'order.a@test.com', password: 'admin1234' };

beforeAll(async () => {
  // Register customers
  const regRes = await request(app).post('/api/auth/register').send(CUSTOMER);
  customerId = (regRes.body as { user: { id: string } }).user.id;
  await request(app).post('/api/auth/register').send(CUSTOMER2);

  // Create admin directly in the user repository
  const { userRepository } = await import('../../auth/auth.registry');
  const { UserEntity } = await import('../../auth/user.entity');
  const { hash } = await import('bcryptjs');
  const adminEntity = UserEntity.create({
    name: ADMIN.name,
    email: ADMIN.email,
    passwordHash: await hash(ADMIN.password, 10),
    role: 'ADMIN',
  });
  await userRepository.create(adminEntity);

  // Get tokens
  const [cRes, aRes, o2Res] = await Promise.all([
    request(app).post('/api/auth/login').send({ email: CUSTOMER.email, password: CUSTOMER.password }),
    request(app).post('/api/auth/login').send({ email: ADMIN.email, password: ADMIN.password }),
    request(app).post('/api/auth/login').send({ email: CUSTOMER2.email, password: CUSTOMER2.password }),
  ]);
  customerToken = (cRes.body as { accessToken: string }).accessToken;
  adminToken = (aRes.body as { accessToken: string }).accessToken;
  const customer2Id = (o2Res.body as { user: { id: string } }).user.id;

  // Seed orders directly into the repository
  const { checkoutRegistry } = await import('../../checkout/checkout.registry');
  const { OrderEntity } = await import('../../checkout/order.entity');

  const order1 = OrderEntity.create({
    userId: customerId,
    items: [{ id: 'item-1', variantId: 'v1', productId: 'p1', name: 'Camiseta', sku: 'CAM-P', price: 100, qty: 1, image: null }],
    subtotal: 100,
    discount: 0,
    shippingCost: 10,
    tax: 0,
    total: 110,
    couponCode: null,
    paymentIntentId: 'pi_ord1',
    shippingAddress: { street: 'Rua A', city: 'SP', zip: '01000-000' },
  });
  customerOrderId = order1.id;
  await checkoutRegistry.orderRepository.create(order1);

  const order2 = OrderEntity.create({
    userId: customerId,
    items: [],
    subtotal: 50,
    discount: 0,
    shippingCost: 5,
    tax: 0,
    total: 55,
    couponCode: null,
    paymentIntentId: 'pi_ord2',
    shippingAddress: null,
  }).pay();
  paidOrderId = order2.id;
  await checkoutRegistry.orderRepository.create(order2);

  const order3 = OrderEntity.create({
    userId: customer2Id,
    items: [],
    subtotal: 200,
    discount: 0,
    shippingCost: 0,
    tax: 0,
    total: 200,
    couponCode: null,
    paymentIntentId: 'pi_ord3',
    shippingAddress: null,
  });
  otherOrderId = order3.id;
  await checkoutRegistry.orderRepository.create(order3);
});

// ── GET /api/orders (CUSTOMER) ────────────────────────────────────────────────
describe('GET /api/orders (CUSTOMER)', () => {
  it('401: deve exigir autenticação', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(401);
  });

  it('200: deve listar apenas pedidos do usuário autenticado', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
    const body = res.body as { items: Array<{ userId: string }> };
    expect(body.items.length).toBeGreaterThanOrEqual(2);
    // All items belong to the customer
    for (const item of body.items) {
      expect(item.userId).toBe(customerId);
    }
  });

  it('deve paginar com cursor', async () => {
    const res = await request(app)
      .get('/api/orders?limit=1')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    const body = res.body as { items: unknown[]; nextCursor: string | null };
    expect(body.items).toHaveLength(1);
    expect(body.nextCursor).not.toBeNull();
  });
});

// ── GET /api/orders/:id (CUSTOMER) ───────────────────────────────────────────
describe('GET /api/orders/:id (CUSTOMER)', () => {
  it('200: deve retornar detalhes do pedido', async () => {
    const res = await request(app)
      .get(`/api/orders/${customerOrderId}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    const body = res.body as { id: string; status: string };
    expect(body.id).toBe(customerOrderId);
    expect(body.status).toBe('PENDING');
  });

  it('403: não deve retornar pedido de outro usuário', async () => {
    const res = await request(app)
      .get(`/api/orders/${otherOrderId}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
  });

  it('404: deve retornar 404 para pedido inexistente', async () => {
    const res = await request(app)
      .get('/api/orders/00000000-0000-4000-8000-000000000099')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(404);
  });
});

// ── PATCH /api/admin/orders/:id/status (ADMIN) ───────────────────────────────
describe('PATCH /api/admin/orders/:id/status (ADMIN)', () => {
  it('403: deve bloquear não-admins', async () => {
    const res = await request(app)
      .patch(`/api/admin/orders/${paidOrderId}/status`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ status: 'SHIPPED' });

    expect(res.status).toBe(403);
  });

  it('200: deve atualizar status para transição válida (PAID → SHIPPED)', async () => {
    const res = await request(app)
      .patch(`/api/admin/orders/${paidOrderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'SHIPPED' });

    expect(res.status).toBe(200);
    expect((res.body as { status: string }).status).toBe('SHIPPED');
  });

  it('400: deve rejeitar transição inválida (PENDING → SHIPPED)', async () => {
    const res = await request(app)
      .patch(`/api/admin/orders/${customerOrderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'SHIPPED' });

    expect(res.status).toBe(400);
  });

  it('deve aceitar trackingCode para status SHIPPED', async () => {
    // Create a fresh PAID order to ship
    const { checkoutRegistry } = await import('../../checkout/checkout.registry');
    const { OrderEntity } = await import('../../checkout/order.entity');
    const freshOrder = OrderEntity.create({
      userId: customerId,
      items: [],
      subtotal: 80,
      discount: 0,
      shippingCost: 10,
      tax: 0,
      total: 90,
      couponCode: null,
      paymentIntentId: 'pi_fresh',
      shippingAddress: null,
    }).pay();
    await checkoutRegistry.orderRepository.create(freshOrder);

    const res = await request(app)
      .patch(`/api/admin/orders/${freshOrder.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'SHIPPED', trackingCode: 'TRACK-BR-123' });

    expect(res.status).toBe(200);
    const body = res.body as { status: string; trackingCode: string };
    expect(body.status).toBe('SHIPPED');
    expect(body.trackingCode).toBe('TRACK-BR-123');
  });
});

// ── GET /api/admin/orders (ADMIN) ────────────────────────────────────────────
describe('GET /api/admin/orders (ADMIN)', () => {
  it('403: deve bloquear não-admins', async () => {
    const res = await request(app)
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
  });

  it('200: deve listar todos os pedidos', async () => {
    const res = await request(app)
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const body = res.body as { items: unknown[] };
    expect(body.items.length).toBeGreaterThanOrEqual(3);
  });

  it('deve filtrar por status', async () => {
    const res = await request(app)
      .get('/api/admin/orders?status=PENDING')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const body = res.body as { items: Array<{ status: string }> };
    for (const item of body.items) {
      expect(item.status).toBe('PENDING');
    }
  });
});
