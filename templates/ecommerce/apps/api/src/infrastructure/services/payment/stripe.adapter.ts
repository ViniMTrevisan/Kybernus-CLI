import Stripe from 'stripe';
import { IPaymentAdapter, PaymentError, PaymentIntentResult } from '../../../application/ports/payment.port';

export class StripeAdapter implements IPaymentAdapter {
  private readonly stripe: Stripe;

  constructor(secretKey: string) {
    this.stripe = new Stripe(secretKey);
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, string>,
  ): Promise<PaymentIntentResult> {
    try {
      const intent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // BRL → centavos
        currency,
        metadata,
        automatic_payment_methods: { enabled: true },
      });

      if (!intent.client_secret) {
        throw new PaymentError('missing_client_secret', 'Stripe não retornou client_secret');
      }

      return { id: intent.id, clientSecret: intent.client_secret };
    } catch (err) {
      if (err instanceof PaymentError) throw err;
      // Wrap Stripe errors in a PaymentError so callers don't depend on Stripe types
      const stripeErr = err as { type?: string; code?: string; message?: string };
      throw new PaymentError(
        stripeErr.code ?? stripeErr.type ?? 'stripe_error',
        stripeErr.message ?? 'Erro no processamento do pagamento',
      );
    }
  }
}
