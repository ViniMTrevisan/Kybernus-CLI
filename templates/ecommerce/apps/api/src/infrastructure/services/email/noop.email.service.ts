import type { IEmailService } from '../../../application/ports/email.port';

/**
 * No-op email service used during tests.
 * Silently discards all messages — no network calls, no side effects.
 */
export class NoopEmailService implements IEmailService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async send(_to: string, _subject: string, _html: string): Promise<void> {
    // intentionally empty
  }
}
