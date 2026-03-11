import nodemailer from 'nodemailer';
import type { IEmailService } from '../../../application/ports/email.port';

/**
 * Email service that uses Ethereal (https://ethereal.email) — a fake SMTP
 * server that captures messages without delivering them. Perfect for
 * development and testing. Logs a preview URL to the console after each send.
 */
export class EtherealEmailService implements IEmailService {
  private transporter: nodemailer.Transporter | null = null;

  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) return this.transporter;

    const testAccount = await nodemailer.createTestAccount();
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    return this.transporter;
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    const transporter = await this.getTransporter();
    const info = await transporter.sendMail({
      from: process.env['EMAIL_FROM'] ?? 'noreply@example.com',
      to,
      subject,
      html,
    });
    console.log(`[Ethereal Email] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  }
}
