// ── PaymentError ──────────────────────────────────────────────────────────────
export class PaymentError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

// ── IPaymentAdapter ───────────────────────────────────────────────────────────
export interface PaymentIntentResult {
  id: string;
  clientSecret: string;
}

export interface IPaymentAdapter {
  createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, string>,
  ): Promise<PaymentIntentResult>;
}
