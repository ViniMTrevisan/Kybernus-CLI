import request from 'supertest';
import app from '../../../app';

/**
 * Integration tests for Profile routes (/api/me).
 * Uses the full Express app with in-memory repositories (NODE_ENV=test-inmemory).
 */

// ── Helpers ──────────────────────────────────────────────────────────────────
const VALID_USER = {
  name: 'Profile User',
  email: 'profile@email.com',
  password: 'senha1234',
};

async function registerAndLogin(user = VALID_USER) {
  await request(app).post('/api/auth/register').send(user);
  const res = await request(app).post('/api/auth/login').send({
    email: user.email,
    password: user.password,
  });
  return (res.body as { accessToken: string }).accessToken;
}

// ── Tests ────────────────────────────────────────────────────────────────────
describe('Profile Routes — Integration', () => {
  // ── GET /api/me ───────────────────────────────────────────────────────────
  describe('GET /api/me', () => {
    it('200: deve retornar perfil do usuário autenticado', async () => {
      const token = await registerAndLogin();

      const res = await request(app)
        .get('/api/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ email: VALID_USER.email, name: VALID_USER.name });
      expect((res.body as Record<string, unknown>)['passwordHash']).toBeUndefined();
    });

    it('401: deve rejeitar requisição sem token', async () => {
      const res = await request(app).get('/api/me');
      expect(res.status).toBe(401);
    });
  });

  // ── PATCH /api/me ─────────────────────────────────────────────────────────
  describe('PATCH /api/me', () => {
    it('200: deve atualizar o nome', async () => {
      const token = await registerAndLogin({
        name: 'Old Name',
        email: 'patchname@email.com',
        password: 'senha1234',
      });

      const res = await request(app)
        .patch('/api/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Name' });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ name: 'New Name' });
    });

    it('400: deve rejeitar body sem campos', async () => {
      const token = await registerAndLogin({
        name: 'Someone',
        email: 'patchnobody@email.com',
        password: 'senha1234',
      });

      const res = await request(app)
        .patch('/api/me')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('401: deve rejeitar requisição sem token', async () => {
      const res = await request(app).patch('/api/me').send({ name: 'New Name' });
      expect(res.status).toBe(401);
    });
  });

  // ── PATCH /api/me/password ────────────────────────────────────────────────
  describe('PATCH /api/me/password', () => {
    it('204: deve trocar a senha com credenciais corretas', async () => {
      const token = await registerAndLogin({
        name: 'Pass User',
        email: 'passchange@email.com',
        password: 'senha1234',
      });

      const res = await request(app)
        .patch('/api/me/password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'senha1234', newPassword: 'novasenha5678' });

      expect(res.status).toBe(204);
    });

    it('401: deve rejeitar senha atual incorreta', async () => {
      const token = await registerAndLogin({
        name: 'Pass User 2',
        email: 'passchange2@email.com',
        password: 'senha1234',
      });

      const res = await request(app)
        .patch('/api/me/password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'wrongpass', newPassword: 'novasenha5678' });

      expect(res.status).toBe(401);
    });

    it('400: deve rejeitar nova senha muito curta', async () => {
      const token = await registerAndLogin({
        name: 'Pass User 3',
        email: 'passchange3@email.com',
        password: 'senha1234',
      });

      const res = await request(app)
        .patch('/api/me/password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'senha1234', newPassword: '123' });

      expect(res.status).toBe(400);
    });

    it('401: deve rejeitar requisição sem token', async () => {
      const res = await request(app)
        .patch('/api/me/password')
        .send({ currentPassword: 'senha1234', newPassword: 'novasenha5678' });
      expect(res.status).toBe(401);
    });
  });

  // ── DELETE /api/me ────────────────────────────────────────────────────────
  describe('DELETE /api/me', () => {
    it('204: deve deletar a conta com senha correta', async () => {
      const token = await registerAndLogin({
        name: 'Delete Me',
        email: 'deleteme@email.com',
        password: 'senha1234',
      });

      const res = await request(app)
        .delete('/api/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ password: 'senha1234' });

      expect(res.status).toBe(204);
    });

    it('401: deve rejeitar senha incorreta', async () => {
      const token = await registerAndLogin({
        name: 'No Delete',
        email: 'nodelete@email.com',
        password: 'senha1234',
      });

      const res = await request(app)
        .delete('/api/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ password: 'wrongpassword' });

      expect(res.status).toBe(401);
    });

    it('401: deve rejeitar requisição sem token', async () => {
      const res = await request(app)
        .delete('/api/me')
        .send({ password: 'senha1234' });
      expect(res.status).toBe(401);
    });
  });
});
