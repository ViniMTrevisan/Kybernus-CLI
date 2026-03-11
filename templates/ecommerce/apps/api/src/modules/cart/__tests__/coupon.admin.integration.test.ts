/**
 * Admin Coupon Routes — Integration Tests (Phase 13)
 * Uses in-memory repositories; runs against the full Express app.
 */
import request from 'supertest';
import app from '../../../app';
import { userRepository } from '../../auth/auth.registry';
import { UserEntity } from '../../auth/user.entity';
import bcrypt from 'bcryptjs';

let adminToken: string;
let customerToken: string;

beforeAll(async () => {
  const adminHash = await bcrypt.hash('admin13pass', 1);
  const admin = UserEntity.create({
    name: 'Admin13',
    email: 'admin13@test.com',
    passwordHash: adminHash,
    role: 'ADMIN',
  });
  await userRepository.create(admin);

  const adminRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin13@test.com', password: 'admin13pass' });
  adminToken = adminRes.body.accessToken as string;

  const custHash = await bcrypt.hash('cust13pass', 1);
  const customer = UserEntity.create({
    name: 'Customer13',
    email: 'customer13@test.com',
    passwordHash: custHash,
    role: 'CUSTOMER',
  });
  await userRepository.create(customer);

  const custRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'customer13@test.com', password: 'cust13pass' });
  customerToken = custRes.body.accessToken as string;
});

describe('Admin Coupon Routes', () => {
  const validPayload = {
    code: 'PHASE13TEST',
    discountType: 'percent',
    discountValue: 15,
    minOrderValue: 0,
    usageLimit: 100,
    expiresAt: null,
  };

  it('POST /api/admin/coupons — 201: cria cupom com dados válidos', async () => {
    const res = await request(app)
      .post('/api/admin/coupons')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: expect.any(String),
      code: 'PHASE13TEST',
      discountType: 'percent',
      discountValue: 15,
      usageCount: 0,
    });
  });

  it('POST /api/admin/coupons — 409: rejeita código duplicado', async () => {
    // First creation
    await request(app)
      .post('/api/admin/coupons')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validPayload, code: 'DUPLICATE13' });

    // Second creation with same code
    const res = await request(app)
      .post('/api/admin/coupons')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validPayload, code: 'DUPLICATE13' });

    expect(res.status).toBe(409);
  });

  it('POST /api/admin/coupons — 400: rejeita payload inválido (discountValue <= 0)', async () => {
    const res = await request(app)
      .post('/api/admin/coupons')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validPayload, code: 'BADVALUE13', discountValue: 0 });

    expect(res.status).toBe(400);
  });

  it('POST /api/admin/coupons — 403: rejeita CUSTOMER', async () => {
    const res = await request(app)
      .post('/api/admin/coupons')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(validPayload);

    expect(res.status).toBe(403);
  });

  it('GET /api/admin/coupons — 200: retorna lista de cupons', async () => {
    const res = await request(app)
      .get('/api/admin/coupons')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it('DELETE /api/admin/coupons/:id — 204: remove cupom', async () => {
    const createRes = await request(app)
      .post('/api/admin/coupons')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validPayload, code: 'DELETEME13' });

    const { id } = createRes.body as { id: string };

    const res = await request(app)
      .delete(`/api/admin/coupons/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);
  });

  it('DELETE /api/admin/coupons/:id — 400: id não-UUID', async () => {
    const res = await request(app)
      .delete('/api/admin/coupons/not-a-uuid')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
  });
});
