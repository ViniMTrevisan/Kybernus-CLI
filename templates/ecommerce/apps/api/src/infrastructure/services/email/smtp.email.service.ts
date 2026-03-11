import nodemailer from 'nodemailer';
import type { IEmailService } from '../../../application/ports/email.port';
import { AppError } from '../../../domain/shared/AppError';

/**
 * Production email service that uses a real SMTP server configured via
 * environment variables: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM.
 */
export class SmtpEmailService implements IEmailService {
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env['SMTP_HOST'],
      port: parseInt(process.env['SMTP_PORT'] ?? '587', 10),
      secure: process.env['SMTP_PORT'] === '465',
      auth: {
        user: process.env['SMTP_USER'],
        pass: process.env['SMTP_PASS'],
      },
    });
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env['EMAIL_FROM'] ?? 'noreply@example.com',
        to,
        subject,
        html,
      });
    } catch {
      throw new AppError('Falha ao enviar email', 500);
    }
  }
}
