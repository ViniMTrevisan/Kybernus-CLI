import request from 'supertest';
import app from '../../../app';

/**
 * Integration tests for Catalog routes.
 * Uses in-memory repositories via the catalog.registry module.
 * An ADMIN JWT is generated with the shared tokenService.
 */

// ── Helpers ──────────────────────────────────────────────────────────────────
let adminToken: string;
let customerToken: string;

const ADMIN_USER = {
  name: 'Admin User',
  email: 'admin@ecommerce.com',
  password: 'admin1234',
};

const CUSTOMER_USER = {
  name: 'João Cliente',
  email: 'joao@ecommerce.com',
  password: 'cliente1234',
};

const VALID_PRODUCT = {
  name: 'Camiseta Básica',
  description: 'Camiseta de algodão',
  price: 49.9,
  categorySlug: 'camisetas',
  images: [],
  variants: [
    { sku: 'CAM-P', size: 'P', color: 'Branco', stock: 5 },
    { sku: 'CAM-M', size: 'M', color: 'Branco', stock: 10 },
  ],
};

// ── Setup ─────────────────────────────────────────────────────────────────────
beforeAll(async () => {
  // Register both users
  await request(app).post('/api/auth/register').send(CUSTOMER_USER);

  // Promote admin via internal registry (since we have no admin-creation endpoint yet)
  const { catalogRegistry } = await import('../catalog.registry');
  const { userRepository } = await import('../../auth/auth.registry');

  // Create category for tests
  await catalogRegistry.categoryRepository.create(
    (await import('../category.entity')).CategoryEntity.create({
      name: 'Camisetas',
      slug: 'camisetas',
      description: null,
      parentId: null,
    }),
  );

  // Create an admin user directly via the repository
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
  const adminRes = await request(app).post('/api/auth/login').send({
    email: ADMIN_USER.email,
    password: ADMIN_USER.password,
  });
  adminToken = (adminRes.body as { accessToken: string }).accessToken;

  const customerRes = await request(app).post('/api/auth/login').send({
    email: CUSTOMER_USER.email,
    password: CUSTOMER_USER.password,
  });
  customerToken = (customerRes.body as { accessToken: string }).accessToken;
});

// ── Tests ────────────────────────────────────────────────────────────────────
describe('Catalog Routes — Integration', () => {
  // ── GET /api/products ─────────────────────────────────────────────────────
  describe('GET /api/products', () => {
    it('200: deve listar produtos paginados (público, sem autenticação)', async () => {
      const res = await request(app).get('/api/products');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('items');
      expect(Array.isArray(res.body.items)).toBe(true);
    });

    it('deve aceitar query params: category, minPrice, maxPrice, q, sortBy', async () => {
      const res = await request(app)
        .get('/api/products')
        .query({ categorySlug: 'camisetas', minPrice: 10, maxPrice: 200, q: 'camiseta', sortBy: 'price_asc' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('items');
    });

    it('deve retornar nextCursor na resposta paginada', async () => {
      const res = await request(app).get('/api/products').query({ limit: 100 });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('nextCursor');
    });
  });

  // ── POST /api/products ────────────────────────────────────────────────────
  describe('POST /api/products', () => {
    it('401: deve rejeitar sem token', async () => {
      const res = await request(app).post('/api/products').send(VALID_PRODUCT);

      expect(res.status).toBe(401);
    });

    it('403: deve rejeitar token de CUSTOMER', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(VALID_PRODUCT);

      expect(res.status).toBe(403);
    });

    it('201: deve criar produto como ADMIN', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(VALID_PRODUCT);

      expect(res.status).toBe(201);
      expect(res.body.name).toBe(VALID_PRODUCT.name);
      expect(res.body.slug).toBe('camiseta-basica');
      expect(res.body.variants).toHaveLength(2);
    });

    it('422: deve validar campos obrigatórios (preço negativo)', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...VALID_PRODUCT, price: -10 });

      expect(res.status).toBe(422);
    });

    it('422: deve rejeitar produto sem nome', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...VALID_PRODUCT, name: '' });

      expect(res.status).toBe(422);
    });
  });

  // ── GET /api/products/:slug ───────────────────────────────────────────────
  describe('GET /api/products/:slug', () => {
    beforeAll(async () => {
      // Ensure product exists
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...VALID_PRODUCT, name: 'Produto Detalhe', variants: [{ sku: 'DET-U', size: 'U', color: 'Preto', stock: 3 }] });
    });

    it('200: deve retornar produto com variações', async () => {
      const res = await request(app).get('/api/products/produto-detalhe');

      expect(res.status).toBe(200);
      expect(res.body.slug).toBe('produto-detalhe');
      expect(Array.isArray(res.body.variants)).toBe(true);
    });

    it('404: deve retornar 404 para slug inexistente', async () => {
      const res = await request(app).get('/api/products/slug-que-nao-existe');

      expect(res.status).toBe(404);
    });
  });

  // ── PUT /api/products/:id ─────────────────────────────────────────────────
  describe('PUT /api/products/:id', () => {
    it('200: deve atualizar produto como ADMIN', async () => {
      // Create a product first
      const createRes = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...VALID_PRODUCT, name: 'Produto Para Atualizar', variants: [{ sku: 'UPD-U', size: 'U', color: 'Rosa', stock: 1 }] });

      const productId = (createRes.body as { id: string }).id;

      const res = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Produto Atualizado', price: 59.9 });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Produto Atualizado');
    });

    it('404: produto inexistente', async () => {
      const res = await request(app)
        .put('/api/products/00000000-0000-4000-8000-000000000099')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'X' });

      expect(res.status).toBe(404);
    });
  });

  // ── DELETE /api/products/:id ──────────────────────────────────────────────
  describe('DELETE /api/products/:id', () => {
    it('204: deve soft-delete o produto', async () => {
      const createRes = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...VALID_PRODUCT, name: 'Produto Para Deletar', variants: [{ sku: 'DEL-U', size: 'U', color: 'Cinza', stock: 1 }] });

      const productId = (createRes.body as { id: string }).id;
      const slug = (createRes.body as { slug: string }).slug;

      const deleteRes = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(204);

      // Deve ocultar produto deletado das listagens públicas
      const getRes = await request(app).get(`/api/products/${slug}`);
      expect(getRes.status).toBe(404);
    });
  });

  // ── PATCH /api/products/:id/stock ────────────────────────────────────────
  describe('PATCH /api/products/:id/stock', () => {
    it('200: deve ajustar estoque por variação', async () => {
      const createRes = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...VALID_PRODUCT, name: 'Produto Estoque', variants: [{ sku: 'STK-U', size: 'U', color: 'Azul', stock: 5 }] });

      const productId = (createRes.body as { id: string }).id;
      const variantId = (createRes.body as { variants: { id: string }[] }).variants[0]!.id;

      const res = await request(app)
        .patch(`/api/products/${productId}/stock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ variantId, delta: -2 });

      expect(res.status).toBe(200);
      expect(res.body.stock).toBe(3);
    });

    it('409: deve rejeitar quando estoque insuficiente', async () => {
      const createRes = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...VALID_PRODUCT, name: 'Produto Estoque Zero', variants: [{ sku: 'STK0-U', size: 'U', color: 'Verde', stock: 2 }] });

      const productId = (createRes.body as { id: string }).id;
      const variantId = (createRes.body as { variants: { id: string }[] }).variants[0]!.id;

      const res = await request(app)
        .patch(`/api/products/${productId}/stock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ variantId, delta: -999 });

      expect(res.status).toBe(409);
    });
  });
});
