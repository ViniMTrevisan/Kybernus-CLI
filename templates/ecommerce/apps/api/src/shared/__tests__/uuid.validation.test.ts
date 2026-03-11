/**
 * Phase 12 — UUID param validation
 *
 * Ensures endpoints that receive :id return 400 immediately for
 * non-UUID values without hitting the database.
 */
import request from 'supertest';
import app from '../../app';

let adminToken: string;
let customerToken: string;

beforeAll(async () => {
  const { userRepository } = await import('../../modules/auth/auth.registry');
  const { UserEntity } = await import('../../modules/auth/user.entity');
  const { hash } = await import('bcryptjs');

  const adminEntity = UserEntity.create({
    name: 'UUID Admin',
    email: 'uuid.admin@test.com',
    passwordHash: await hash('pass1234', 10),
    role: 'ADMIN',
  });
  await userRepository.create(adminEntity);

  const [aRes, cRes] = await Promise.all([
    request(app)
      .post('/api/auth/login')
      .send({ email: 'uuid.admin@test.com', password: 'pass1234' }),
    request(app)
      .post('/api/auth/register')
      .send({ name: 'UUID Customer', email: 'uuid.customer@test.com', password: 'pass1234' }),
  ]);

  adminToken = (aRes.body as { accessToken: string }).accessToken;
  customerToken = (cRes.body as { accessToken: string }).accessToken;
});

const INVALID_IDS = ['not-a-uuid', '123', 'abc-def', 'totally-wrong-format'];
const VALID_UUID = '00000000-0000-4000-8000-000000000001';

describe('UUID param validation — GET /api/orders/:id', () => {
  it.each(INVALID_IDS)('400 para id "%s"', async (id) => {
    const res = await request(app)
      .get(`/api/orders/${id}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(400);
    expect((res.body as { error: string }).error).toMatch(/uuid|id inválido/i);
  });

  it('404 normal para UUID válido mas inexistente', async () => {
    const res = await request(app)
      .get(`/api/orders/${VALID_UUID}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(404);
  });
});

describe('UUID param validation — PATCH /api/admin/orders/:id/status', () => {
  it.each(INVALID_IDS)('400 para id "%s"', async (id) => {
    const res = await request(app)
      .patch(`/api/admin/orders/${id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'SHIPPED' });
    expect(res.status).toBe(400);
    expect((res.body as { error: string }).error).toMatch(/uuid|id inválido/i);
  });
});

describe('UUID param validation — PATCH /api/admin/users/:id', () => {
  it.each(INVALID_IDS)('400 para id "%s"', async (id) => {
    const res = await request(app)
      .patch(`/api/admin/users/${id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'ADMIN' });
    expect(res.status).toBe(400);
    expect((res.body as { error: string }).error).toMatch(/uuid|id inválido/i);
  });
});

describe('UUID param validation — PUT /api/products/:id', () => {
  it.each(INVALID_IDS)('400 para id "%s"', async (id) => {
    const res = await request(app)
      .put(`/api/products/${id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated' });
    expect(res.status).toBe(400);
    expect((res.body as { error: string }).error).toMatch(/uuid|id inválido/i);
  });
});

describe('UUID param validation — DELETE /api/products/:id', () => {
  it.each(INVALID_IDS)('400 para id "%s"', async (id) => {
    const res = await request(app)
      .delete(`/api/products/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
    expect((res.body as { error: string }).error).toMatch(/uuid|id inválido/i);
  });
});

describe('UUID param validation — PATCH /api/products/:id/stock', () => {
  it.each(INVALID_IDS)('400 para id "%s"', async (id) => {
    const res = await request(app)
      .patch(`/api/products/${id}/stock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ variantId: 'v1', delta: 5 });
    expect(res.status).toBe(400);
    expect((res.body as { error: string }).error).toMatch(/uuid|id inválido/i);
  });
});
