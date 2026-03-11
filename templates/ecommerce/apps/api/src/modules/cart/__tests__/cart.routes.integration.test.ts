import request from 'supertest';
import app from '../../../app';

/**
 * Integration tests for Cart routes.
 * Uses in-memory repositories via the cart.registry module.
 */

let customerToken: string;
let adminToken: string;
let productId: string;
let variantId: string;

const CUSTOMER_USER = {
  name: 'Cart Customer',
  email: 'cart.customer@ecommerce.com',
  password: 'cartpass123',
};

const ADMIN_USER = {
  name: 'Cart Admin',
  email: 'cart.admin@ecommerce.com',
  password: 'adminpass123',
};

beforeAll(async () => {
  // Register customer
  await request(app).post('/api/auth/register').send(CUSTOMER_USER);

  // Create admin via registry
  const { userRepository } = await import('../../auth/auth.registry');
  const { UserEntity } = await import('../../auth/user.entity');
  const { hash } = await import('bcryptjs');
  const adminHash = await hash(ADMIN_USER.password, 10);
  const adminEntity = UserEntity.create({
    name: ADMIN_USER.name,
    email: ADMIN_USER.email,
    passwordHash: adminHash,
    role: 'ADMIN',
  });
  await userRepository.create(adminEntity);

  // Login both
  const customerRes = await request(app).post('/api/auth/login').send({
    email: CUSTOMER_USER.email,
    password: CUSTOMER_USER.password,
  });
  customerToken = (customerRes.body as { accessToken: string }).accessToken;

  const adminRes = await request(app).post('/api/auth/login').send({
    email: ADMIN_USER.email,
    password: ADMIN_USER.password,
  });
  adminToken = (adminRes.body as { accessToken: string }).accessToken;

  // Create a product+variant via catalog API for cart tests
  const { catalogRegistry } = await import('../../catalog/catalog.registry');
  const { CategoryEntity } = await import('../../catalog/category.entity');
  await catalogRegistry.categoryRepository.create(
    CategoryEntity.create({ name: 'Cart Test', slug: 'cart-test', description: null, parentId: null }),
  );

  const productRes = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: 'Produto do Carrinho',
      price: 99.9,
      categorySlug: 'cart-test',
      images: [],
      variants: [{ sku: 'CART-P', size: 'P', color: 'Azul', stock: 10 }],
    });
  const body = productRes.body as { id: string; variants: Array<{ id: string }> };
  productId = body.id;
  variantId = body.variants[0]!.id;
});

// ── GET /api/cart ─────────────────────────────────────────────────────────────
describe('GET /api/cart', () => {
  it('200: deve retornar carrinho vazio se não existir', async () => {
    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ items: [], subtotal: 0, discount: 0, total: 0 });
  });

  it('401: deve exigir autenticação', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(401);
  });
});

// ── POST /api/cart/items ──────────────────────────────────────────────────────
describe('POST /api/cart/items', () => {
  it('201: deve adicionar item ao carrinho', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId, variantId, qty: 2 });

    expect(res.status).toBe(201);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].qty).toBe(2);
    expect(res.body.subtotal).toBeCloseTo(199.8, 1);
  });

  it('400: deve rejeitar quantidade <= 0', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId, variantId, qty: 0 });

    expect(res.status).toBe(400);
  });

  it('409: deve retornar erro se estoque insuficiente', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId, variantId, qty: 9999 });

    expect(res.status).toBe(409);
  });
});

// ── PATCH /api/cart/items/:variantId ──────────────────────────────────────────
describe('PATCH /api/cart/items/:variantId', () => {
  it('200: deve atualizar quantidade do item', async () => {
    const res = await request(app)
      .patch(`/api/cart/items/${variantId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ qty: 3 });

    expect(res.status).toBe(200);
    expect(res.body.items[0].qty).toBe(3);
  });

  it('deve remover item automaticamente se quantidade = 0', async () => {
    const res = await request(app)
      .patch(`/api/cart/items/${variantId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ qty: 0 });

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(0);
  });
});

// Re-add item for remaining tests
let secondVariantId: string;

beforeAll(async () => {
  // Add item back after the update-to-zero test removes it
  // Also grab a second variantId for DELETE test isolation
  secondVariantId = variantId; // reuse for simplicity
});

// ── DELETE /api/cart/items/:variantId ─────────────────────────────────────────
describe('DELETE /api/cart/items/:variantId', () => {
  it('204: deve remover item', async () => {
    // First add item back
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId, variantId, qty: 1 });

    const res = await request(app)
      .delete(`/api/cart/items/${variantId}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(204);

    const cart = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`);
    expect((cart.body as { items: unknown[] }).items).toHaveLength(0);
  });
});

// ── POST /api/cart/coupon ─────────────────────────────────────────────────────
describe('POST /api/cart/coupon', () => {
  it('200: deve aplicar cupom válido e retornar total atualizado', async () => {
    // Add item first
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId, variantId, qty: 1 });

    const res = await request(app)
      .post('/api/cart/coupon')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ code: 'PROMO10' });

    expect(res.status).toBe(200);
    expect(res.body.discount).toBeGreaterThan(0);
    expect(res.body.couponCode).toBe('PROMO10');
  });

  it('404: deve rejeitar cupom inexistente', async () => {
    const res = await request(app)
      .post('/api/cart/coupon')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ code: 'NAOEXISTE' });

    expect(res.status).toBe(404);
  });

  it('400: deve rejeitar cupom expirado', async () => {
    const res = await request(app)
      .post('/api/cart/coupon')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ code: 'EXPIRED' });

    expect(res.status).toBe(400);
  });
});

// ── GET /api/cart/shipping ────────────────────────────────────────────────────
describe('GET /api/cart/shipping', () => {
  it('200: deve retornar opções de frete calculadas para um CEP', async () => {
    const res = await request(app)
      .get('/api/cart/shipping?cep=01310100')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('price');
    expect(res.body[0]).toHaveProperty('estimatedDays');
  });

  it('400: deve rejeitar CEP inválido', async () => {
    const res = await request(app)
      .get('/api/cart/shipping?cep=123')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(400);
  });
});
