import request from 'supertest';
import app from '../app';

describe('App — Health & Error Handling', () => {
  describe('GET /health', () => {
    it('deve retornar 200 com { status: "ok" }', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });

  describe('Rota inexistente', () => {
    it('deve retornar 404 com shape { error: string }', async () => {
      const res = await request(app).get('/rota-que-nao-existe');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
      expect(typeof res.body.error).toBe('string');
    });
  });

  describe('Error Handler Global', () => {
    it('deve retornar 500 sem vazar stack trace em producao', async () => {
      const originalEnv = process.env['NODE_ENV'];
      process.env['NODE_ENV'] = 'production';

      // /test-error lança um Error propositalmente (rota de teste)
      const res = await request(app).get('/test-error');

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error');
      expect(res.body.stack).toBeUndefined();

      process.env['NODE_ENV'] = originalEnv;
    });
  });
});
