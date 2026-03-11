import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../../../app';
import { userRepository } from '../../auth/auth.registry';
import { orderRepository } from '../../checkout/checkout.registry';
import { UserEntity } from '../../auth/user.entity';
import { OrderEntity } from '../../checkout/order.entity';

describe('Admin Routes — Integration', () => {
  let adminToken: string;
  let adminId: string;
  let customerToken: string;
  let customer1Id: string;
  let customer2Id: string;

  beforeAll(async () => {
    // ── Users ──────────────────────────────────────────────────────────────
    const adminHash = await bcrypt.hash('admin123', 1);
    const admin = UserEntity.create({
      name: 'Admin',
      email: 'admin6@test.com',
      passwordHash: adminHash,
      role: 'ADMIN',
    });
    await userRepository.create(admin);
    adminId = admin.id;

    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin6@test.com', password: 'admin123' });
    adminToken = adminRes.body.accessToken as string;

    const c1Hash = await bcrypt.hash('pass123', 1);
    const customer1 = UserEntity.create({
      name: 'Alice',
      email: 'alice6@test.com',
      passwordHash: c1Hash,
    });
    await userRepository.create(customer1);
    customer1Id = customer1.id;

    const c1Res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice6@test.com', password: 'pass123' });
    customerToken = c1Res.body.accessToken as string;

    const c2Hash = await bcrypt.hash('pass456', 1);
    const customer2 = UserEntity.create({
      name: 'Bob',
      email: 'bob6@test.com',
      passwordHash: c2Hash,
    });
    await userRepository.create(customer2);
    customer2Id = customer2.id;

    // ── Seed orders ────────────────────────────────────────────────────────
    // Order 1: PAID, customer1, total=100, prod-1 qty=3
    const order1 = OrderEntity.create({
      userId: customer1Id,
      items: [
        {
          id: 'i1',
          productId: 'prod-1',
          variantId: 'v1',
          name: 'Camiseta',
          sku: 'CAM-1',
          price: 33.33,
          qty: 3,
          image: null,
        },
      ],
      subtotal: 100,
      discount: 0,
      shippingCost: 0,
      tax: 0,
      total: 100,
      couponCode: null,
      paymentIntentId: 'pi_adm1',
      shippingAddress: null,
    }).pay();
    await orderRepository.create(order1);

    // Order 2: SHIPPED, customer2, total=200, prod-2 qty=1
    const order2 = OrderEntity.create({
      userId: customer2Id,
      items: [
        {
          id: 'i2',
          productId: 'prod-2',
          variantId: 'v2',
          name: 'Calça',
          sku: 'CAL-1',
          price: 200,
          qty: 1,
          image: null,
        },
      ],
      subtotal: 200,
      discount: 0,
      shippingCost: 0,
      tax: 0,
      total: 200,
      couponCode: null,
      paymentIntentId: 'pi_adm2',
      shippingAddress: null,
    })
      .pay()
      .ship();
    await orderRepository.create(order2);

    // Order 3: PENDING (should NOT count for revenue)
    const order3 = OrderEntity.create({
      userId: customer1Id,
      items: [
        {
          id: 'i3',
          productId: 'prod-1',
          variantId: 'v1',
          name: 'Camiseta',
          sku: 'CAM-1',
          price: 50,
          qty: 1,
          image: null,
        },
      ],
      subtotal: 50,
      discount: 0,
      shippingCost: 0,
      tax: 0,
      total: 50,
      couponCode: null,
      paymentIntentId: null,
      shippingAddress: null,
    });
    await orderRepository.create(order3);
  });

  // ── GET /api/admin/dashboard/stats ────────────────────────────────────────
  describe('GET /api/admin/dashboard/stats', () => {
    it('403: deve bloquear não-admins', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard/stats')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
    });

    it('deve retornar totalRevenue, totalOrders, totalCustomers, avgOrderValue', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        totalRevenue: 300,    // PAID(100) + SHIPPED(200)
        totalOrders: 3,       // all 3 orders
        totalCustomers: 2,    // customer1 + customer2 have revenue orders
        avgOrderValue: 150,   // 300 / 2 revenue orders
      });
    });

    it('deve aceitar filtro period=today', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard/stats?period=today')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      // All orders were created during this test run (today)
      expect(res.body.totalOrders).toBe(3);
    });

    it('deve aceitar filtro period=month', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard/stats?period=month')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.totalRevenue).toBe(300);
    });
  });

  // ── GET /api/admin/dashboard/top-products ─────────────────────────────────
  describe('GET /api/admin/dashboard/top-products', () => {
    it('deve retornar produtos mais vendidos ordenados por qty desc', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard/top-products')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.items)).toBe(true);
      // prod-1: qty=3 (order1 PAID); prod-2: qty=1 (order2 SHIPPED)
      // order3 is PENDING — must NOT be counted
      expect(res.body.items[0]).toMatchObject({ productId: 'prod-1', totalQty: 3 });
      expect(res.body.items[1]).toMatchObject({ productId: 'prod-2', totalQty: 1 });
    });
  });

  // ── GET /api/admin/users ──────────────────────────────────────────────────
  describe('GET /api/admin/users', () => {
    it('403: deve bloquear não-admins', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
    });

    it('200: deve listar usuários com paginação', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.items.length).toBeGreaterThanOrEqual(3); // admin + 2 customers
      expect(res.body).toHaveProperty('nextCursor');
    });

    it('deve filtrar por role=CUSTOMER', async () => {
      const res = await request(app)
        .get('/api/admin/users?role=CUSTOMER')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(
        res.body.items.every((u: { role: string }) => u.role === 'CUSTOMER'),
      ).toBe(true);
      expect(res.body.items.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ── PATCH /api/admin/users/:id ────────────────────────────────────────────
  describe('PATCH /api/admin/users/:id', () => {
    it('200: deve atualizar role de CUSTOMER para ADMIN', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${customer1Id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'ADMIN' });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ message: expect.any(String) });

      // Verify the change persisted
      const listRes = await request(app)
        .get('/api/admin/users?role=ADMIN')
        .set('Authorization', `Bearer ${adminToken}`);
      const ids = listRes.body.items.map((u: { id: string }) => u.id);
      expect(ids).toContain(customer1Id);
    });

    it('403: deve bloquear admin de alterar o próprio role', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${adminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'CUSTOMER' });
      expect(res.status).toBe(403);
    });
  });
});
