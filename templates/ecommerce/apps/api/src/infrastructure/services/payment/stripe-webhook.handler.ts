import Stripe from 'stripe';
import { AppError } from '../../../domain/shared/AppError';
import type { IOrderRepository } from '../../../domain/checkout/order.repository';
import type { ICouponRepository } from '../../../domain/cart/coupon.repository';
import type { IEmailService } from '../../../application/ports/email.port';
import type { IUserRepository } from '../../../domain/auth/user.repository';
import { OrderEntity } from '../../../domain/checkout/order.entity';

export class StripeWebhookHandler {
  private readonly stripe: Stripe;

  constructor(
    secretKey: string,
    private readonly webhookSecret: string,
    private readonly orderRepo: IOrderRepository,
    private readonly couponRepo?: ICouponRepository,
    private readonly emailService?: IEmailService,
    private readonly userRepo?: IUserRepository,
  ) {
    this.stripe = new Stripe(secretKey);
  }

  async handleEvent(payload: string, signature: string): Promise<void> {
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
    } catch {
      throw new AppError('Webhook Stripe: assinatura inválida', 400);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this._handleSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await this._handleFailed(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        // Unknown events are silently ignored
        break;
    }
  }

  private async _handleSucceeded(pi: Stripe.PaymentIntent): Promise<void> {
    const order = await this.orderRepo.findByPaymentIntentId(pi.id);
    if (!order) return; // Order not found — ignore
    if (order.status === 'PAID') return; // Idempotent: already processed
    const updated = order.pay();
    await this.orderRepo.update(updated);
    if (order.couponCode && this.couponRepo) {
      await this.couponRepo.incrementUsage(order.couponCode);
    }
    await this._sendOrderConfirmedEmail(updated);
  }

  private async _sendOrderConfirmedEmail(order: OrderEntity): Promise<void> {
    if (!this.emailService || !this.userRepo) return;
    try {
      const user = await this.userRepo.findById(order.userId);
      if (!user) return;
      const itemsHtml = order.items
        .map((i) => `<li>${i.name} x${i.qty} — R$ ${(i.price * i.qty).toFixed(2)}</li>`)
        .join('');
      const html = `
        <h2>Pedido confirmado!</h2>
        <p>Olá ${user.name}, seu pedido <strong>#${order.id.slice(0, 8)}</strong> foi confirmado.</p>
        <ul>${itemsHtml}</ul>
        <p><strong>Total: R$ ${order.total.toFixed(2)}</strong></p>
        <p>Prazo estimado de entrega: 5–10 dias úteis.</p>
      `;
      await this.emailService.send(user.email, 'Pedido confirmado 🎉', html);
    } catch {
      // Email failure must never break the webhook flow
    }
  }

  private async _handleFailed(pi: Stripe.PaymentIntent): Promise<void> {
    const order = await this.orderRepo.findByPaymentIntentId(pi.id);
    if (!order) return;
    if (order.status === 'FAILED') return; // Idempotent
    await this.orderRepo.update(order.fail());
  }
}
