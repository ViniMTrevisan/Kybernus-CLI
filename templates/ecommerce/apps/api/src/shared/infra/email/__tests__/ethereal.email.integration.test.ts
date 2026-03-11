/**
 * Integration test for EtherealEmailService.
 * Hits the real Ethereal SMTP endpoint (no real delivery — Ethereal captures it).
 * Run with: npm test (jest picks up all *.test.ts)
 */
import { EtherealEmailService } from '../EtherealEmailService';

describe('EtherealEmailService', () => {
  let service: EtherealEmailService;

  beforeEach(() => {
    service = new EtherealEmailService();
  });

  it('deve enviar email sem lançar erro', async () => {
    await expect(
      service.send('dest@example.com', 'Teste', '<p>Hello</p>'),
    ).resolves.not.toThrow();
  }, 15_000); // network timeout — ethereal can be slow

  it('deve registrar preview URL após envio', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await service.send('dest@example.com', 'Preview URL test', '<p>Test</p>');

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Ethereal'),
    );

    consoleSpy.mockRestore();
  }, 15_000);
});
