import request from 'supertest';
import app from '../../../app';
import { UserEntity } from '../../auth/user.entity';
import { hash } from 'bcryptjs';

/**
 * Integration tests for POST /api/products/:id/image
 * Uses in-memory repos + in-memory storage (no S3 needed)
 */

let adminToken: string;
let productId: string;

const ADMIN_USER = {
  name: 'Admin Image',
  email: 'admin.image@test.com',
  password: 'admin1234',
};

const VALID_PRODUCT = {
  name: 'Tênis de Upload',
  description: 'Para testar upload',
  price: 199.9,
  categorySlug: 'calcados',
  images: [],
  variants: [{ sku: 'TEI-40', size: '40', color: 'Preto', stock: 5 }],
};

beforeAll(async () => {
  const { catalogRegistry } = await import('../catalog.registry');
  const { userRepository } = await import('../../auth/auth.registry');

  // Seed category
  const { CategoryEntity } = await import('../category.entity');
  await catalogRegistry.categoryRepository.create(
    CategoryEntity.create({ name: 'Calçados', slug: 'calcados', description: null, parentId: null }),
  );

  // Create admin directly
  const adminHash = await hash(ADMIN_USER.password, 10);
  await userRepository.create(
    UserEntity.create({ name: ADMIN_USER.name, email: ADMIN_USER.email, passwordHash: adminHash, role: 'ADMIN' }),
  );

  // Login
  const loginRes = await request(app).post('/api/auth/login').send({
    email: ADMIN_USER.email,
    password: ADMIN_USER.password,
  });
  adminToken = (loginRes.body as { accessToken: string }).accessToken;

  // Create a product to upload to
  const productRes = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(VALID_PRODUCT);
  productId = (productRes.body as { id: string }).id;
});

describe('POST /api/products/:id/image', () => {
  it('401: deve rejeitar sem autenticação', async () => {
    await request(app)
      .post(`/api/products/${productId}/image`)
      .attach('image', Buffer.from('fake'), { filename: 'foto.jpg', contentType: 'image/jpeg' })
      .expect(401);
  });

  it('403: deve rejeitar se não for ADMIN', async () => {
    // Register a customer
    await request(app).post('/api/auth/register').send({
      name: 'Cliente',
      email: 'cliente.img@test.com',
      password: 'cliente1234',
    });
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'cliente.img@test.com',
      password: 'cliente1234',
    });
    const customerToken = (loginRes.body as { accessToken: string }).accessToken;

    await request(app)
      .post(`/api/products/${productId}/image`)
      .set('Authorization', `Bearer ${customerToken}`)
      .attach('image', Buffer.from('fake'), { filename: 'foto.jpg', contentType: 'image/jpeg' })
      .expect(403);
  });

  it('400: deve rejeitar arquivo não-imagem', async () => {
    await request(app)
      .post(`/api/products/${productId}/image`)
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('image', Buffer.from('text content'), { filename: 'doc.txt', contentType: 'text/plain' })
      .expect(400);
  });

  it('400: deve rejeitar arquivo maior que 5MB', async () => {
    const bigBuffer = Buffer.alloc(6 * 1024 * 1024);
    await request(app)
      .post(`/api/products/${productId}/image`)
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('image', bigBuffer, { filename: 'big.jpg', contentType: 'image/jpeg' })
      .expect(400);
  });

  it('200: deve fazer upload e retornar URL pública da imagem', async () => {
    const res = await request(app)
      .post(`/api/products/${productId}/image`)
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('image', Buffer.from('fake-image-data'), { filename: 'foto.jpg', contentType: 'image/jpeg' })
      .expect(200);

    const body = res.body as { images: string[] };
    expect(body.images).toBeDefined();
    expect(body.images.length).toBeGreaterThan(0);
    expect(typeof body.images[0]).toBe('string');
  });

  it('deve atualizar campo images no produto após upload', async () => {
    // Upload
    await request(app)
      .post(`/api/products/${productId}/image`)
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('image', Buffer.from('image-bytes'), { filename: 'produto.png', contentType: 'image/png' });

    // Fetch product and check images
    const getRes = await request(app).get(`/api/products/tenis-de-upload`).expect(200);
    const product = getRes.body as { images: string[] };
    expect(product.images.length).toBeGreaterThanOrEqual(1);
  });
});
