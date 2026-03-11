/**
 * StripeAdapter — Unit Tests
 * Stripe SDK is mocked so these tests run without any network access.
 */

// Mock must be hoisted before import
jest.mock('stripe');

import Stripe from 'stripe';
import { StripeAdapter } from '../adapters/stripe.adapter';
import { PaymentError } from '../payment.port';

const mockCreate = jest.fn();
const mockConfirm = jest.fn();

// Mock the Stripe constructor to return a controlled instance
(Stripe as jest.MockedClass<typeof Stripe>).mockImplementation(() => ({
  paymentIntents: {
    create: mockCreate,
    confirm: mockConfirm,
  },
} as unknown as Stripe));

describe('StripeAdapter — Unit', () => {
  let adapter: StripeAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new StripeAdapter('sk_test_fake');
  });

  it('deve criar PaymentIntent com amount e currency corretos', async () => {
    mockCreate.mockResolvedValue({ id: 'pi_1', client_secret: 'pi_1_secret_abc' });

    await adapter.createPaymentIntent(199.9, 'brl', { orderId: 'ord-1' });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 19990, currency: 'brl' }),
    );
  });

  it('deve retornar clientSecret do PaymentIntent criado', async () => {
    mockCreate.mockResolvedValue({ id: 'pi_1', client_secret: 'pi_1_secret_abc' });

    const result = await adapter.createPaymentIntent(100, 'brl', {});

    expect(result.clientSecret).toBe('pi_1_secret_abc');
    expect(result.id).toBe('pi_1');
  });

  it('deve converter valor de reais para centavos (R$10,00 → 1000)', async () => {
    mockCreate.mockResolvedValue({ id: 'pi_2', client_secret: 'secret' });

    await adapter.createPaymentIntent(10, 'brl', {});

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 1000 }),
    );
  });

  it('deve lançar PaymentError se Stripe retornar erro de cartão recusado', async () => {
    const stripeErr = Object.assign(new Error('Your card was declined.'), {
      type: 'StripeCardError',
      code: 'card_declined',
    });
    mockCreate.mockRejectedValue(stripeErr);

    await expect(adapter.createPaymentIntent(100, 'brl', {})).rejects.toThrow(PaymentError);
  });

  it('deve lançar PaymentError se Stripe retornar erro de autenticação', async () => {
    const stripeErr = Object.assign(new Error('No such API key.'), {
      type: 'StripeAuthenticationError',
    });
    mockCreate.mockRejectedValue(stripeErr);

    await expect(adapter.createPaymentIntent(100, 'brl', {})).rejects.toThrow(PaymentError);
  });

  it('deve construir instância com secretKey fornecida', () => {
    const adapterWithKey = new StripeAdapter('sk_test_mykey');
    expect(adapterWithKey).toBeInstanceOf(StripeAdapter);
  });
});
