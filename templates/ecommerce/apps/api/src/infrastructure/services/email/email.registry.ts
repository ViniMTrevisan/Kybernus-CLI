import type { IEmailService } from '../../../application/ports/email.port';
import { EtherealEmailService } from './ethereal.email.service';
import { SmtpEmailService } from './smtp.email.service';
import { NoopEmailService } from './noop.email.service';

/**
 * Picks the email service implementation based on NODE_ENV.
 *   production → SmtpEmailService  (real SMTP via env vars)
 *   test / test-inmemory → NoopEmailService  (silent, no network calls)
 *   everything else → EtherealEmailService  (fake SMTP, no real delivery)
 */
const env = process.env['NODE_ENV'];
export const emailService: IEmailService =
  env === 'production'
    ? new SmtpEmailService()
    : env === 'test' || env === 'test-inmemory'
      ? new NoopEmailService()
      : new EtherealEmailService();
