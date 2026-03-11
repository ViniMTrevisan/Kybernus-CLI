import request from 'supertest';
import app from '../../../app';

/**
 * Integration tests for Auth routes.
 * These tests run against the full Express app (no DB — repository is mocked
 * at the module level so we don't need Docker/Testcontainers for Phase 1 unit
 * integration tests; Prisma integration tests will be added when the DB
 * migration is applied in the real test environment).
 */

// ── Helpers ──────────────────────────────────────────────────────────────────
const VALID_REGISTER = {
  name: 'João Silva',
  email: 'joao@email.com',
  password: 'senha1234',
};

// ── Tests ────────────────────────────────────────────────────────────────────
describe('Auth Routes — Integration', () => {
  describe('POST /api/auth/register', () => {
    it('201: deve registrar usuário com dados válidos', async () => {
      const res = await request(app).post('/api/auth/register').send(VALID_REGISTER);

      expect(res.status).toBe(201);
      expect(res.body.user).toMatchObject({ email: VALID_REGISTER.email });
      expect((res.body.user as Record<string, unknown>)['passwordHash']).toBeUndefined();
      expect(res.body.accessToken).toBeTruthy();
    });

    it('409: deve retornar conflict para email duplicado', async () => {
      await request(app).post('/api/auth/register').send(VALID_REGISTER);
      const res = await request(app).post('/api/auth/register').send(VALID_REGISTER);

      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty('error');
    });

    it('422: deve retornar erros de validação para email inválido', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'João',
        email: 'not-an-email',
        password: 'senha1234',
      });

      expect(res.status).toBe(422);
      expect(res.body).toHaveProperty('errors');
    });

    it('422: deve retornar erro para senha menor que 8 caracteres', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'João',
        email: 'joao2@email.com',
        password: '123',
      });

      expect(res.status).toBe(422);
    });

    it('422: deve retornar erro para name vazio', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: '',
        email: 'joao3@email.com',
        password: 'senha1234',
      });

      expect(res.status).toBe(422);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(VALID_REGISTER);
    });

    it('200: deve retornar accessToken no body e refreshToken como httpOnly cookie', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: VALID_REGISTER.email,
        password: VALID_REGISTER.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeTruthy();

      const cookies: string[] = res.headers['set-cookie'] as unknown as string[];
      expect(cookies).toBeDefined();
      const refreshCookie = cookies.find((c) => c.startsWith('refreshToken='));
      expect(refreshCookie).toBeDefined();
      expect(refreshCookie).toContain('HttpOnly');
    });

    it('401: deve rejeitar credenciais com senha incorreta', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: VALID_REGISTER.email,
        password: 'senha_errada',
      });

      expect(res.status).toBe(401);
    });

    it('401: deve rejeitar email inexistente', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'naoexiste@email.com',
        password: 'senha1234',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('200: deve retornar novo accessToken com refreshToken válido no cookie', async () => {
      await request(app).post('/api/auth/register').send(VALID_REGISTER);
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: VALID_REGISTER.email, password: VALID_REGISTER.password });

      const cookies: string[] = loginRes.headers['set-cookie'] as unknown as string[];
      const cookieHeader = cookies.find((c) => c.startsWith('refreshToken=')) ?? '';

      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', cookieHeader.split(';')[0] ?? '');

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeTruthy();
    });

    it('401: deve rejeitar requisição sem cookie de refresh', async () => {
      const res = await request(app).post('/api/auth/refresh');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('204: deve invalidar o refreshToken e limpar o cookie', async () => {
      await request(app).post('/api/auth/register').send(VALID_REGISTER);
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: VALID_REGISTER.email, password: VALID_REGISTER.password });

      const cookies: string[] = loginRes.headers['set-cookie'] as unknown as string[];
      const cookieHeader = cookies.find((c) => c.startsWith('refreshToken=')) ?? '';
      const cookieValue = cookieHeader.split(';')[0] ?? '';

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', cookieValue);

      expect(res.status).toBe(204);

      // Refresh deve falhar após logout
      const refreshRes = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', cookieValue);
      expect(refreshRes.status).toBe(401);
    });
  });

  describe('Middleware: authenticate', () => {
    it('401: deve rejeitar requisição sem Bearer token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
    });

    it('401: deve rejeitar token malformado', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer not-a-valid-jwt');

      expect(res.status).toBe(401);
    });

    it('200: deve retornar dados do usuário para token válido', async () => {
      await request(app).post('/api/auth/register').send(VALID_REGISTER);
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: VALID_REGISTER.email, password: VALID_REGISTER.password });

      const { accessToken } = loginRes.body as { accessToken: string };

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe(VALID_REGISTER.email);
      expect((res.body as Record<string, unknown>)['passwordHash']).toBeUndefined();
    });
  });

  describe('Middleware: authorize (ADMIN only)', () => {
    it('403: deve bloquear usuário CUSTOMER em rota de ADMIN', async () => {
      await request(app).post('/api/auth/register').send(VALID_REGISTER);
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: VALID_REGISTER.email, password: VALID_REGISTER.password });

      const { accessToken } = loginRes.body as { accessToken: string };

      // /api/auth/admin-test é uma rota protegida por authorize('ADMIN')
      const res = await request(app)
        .get('/api/auth/admin-test')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(403);
    });
  });
});
