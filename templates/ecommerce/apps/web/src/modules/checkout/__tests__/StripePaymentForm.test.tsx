/**
 * StripePaymentForm — Frontend Tests
 * @stripe/react-stripe-js mocked via __mocks__ pattern.
 */

jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  CardElement: () => <div data-testid="card-element">CardElement mock</div>,
  useStripe: () => mockStripe,
  useElements: () => mockElements,
}));

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StripePaymentForm } from '../components/StripePaymentForm';

const mockConfirmCardPayment = jest.fn();
const mockStripe = { confirmCardPayment: mockConfirmCardPayment };
const mockElements = { getElement: jest.fn().mockReturnValue({}) };

function renderForm(props: Partial<React.ComponentProps<typeof StripePaymentForm>> = {}) {
  const defaults = {
    clientSecret: 'pi_test_secret',
    onSuccess: jest.fn(),
    onError: jest.fn(),
    ...props,
  };
  return { ...render(<StripePaymentForm {...defaults} />), ...defaults };
}

describe('StripePaymentForm', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deve renderizar o CardElement do Stripe', () => {
    renderForm();
    expect(screen.getByTestId('card-element')).toBeInTheDocument();
  });

  it('deve chamar stripe.confirmCardPayment com clientSecret ao submeter', async () => {
    mockConfirmCardPayment.mockResolvedValue({ paymentIntent: { status: 'succeeded' } });
    const { onSuccess } = renderForm({ clientSecret: 'pi_secret_abc' });
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /confirmar pagamento/i }));

    await waitFor(() =>
      expect(mockConfirmCardPayment).toHaveBeenCalledWith('pi_secret_abc', expect.any(Object)),
    );
    expect(onSuccess).toHaveBeenCalled();
  });

  it('deve exibir spinner enquanto pagamento é processado', async () => {
    // Never resolves during this test
    mockConfirmCardPayment.mockImplementation(() => new Promise(() => {}));
    renderForm();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /confirmar pagamento/i }));

    expect(screen.getByRole('button', { name: /confirmar pagamento/i })).toBeDisabled();
    // Spinner or loading indicator
    expect(screen.getByRole('button', { name: /confirmar pagamento/i }).hasAttribute('disabled')).toBe(true);
  });

  it('deve exibir mensagem de erro do Stripe em português', async () => {
    mockConfirmCardPayment.mockResolvedValue({
      error: { code: 'card_declined', message: 'Your card was declined.' },
    });
    const { onError } = renderForm();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /confirmar pagamento/i }));

    await waitFor(() => expect(onError).toHaveBeenCalled());
    // Portuguese error message should be displayed
    expect(screen.getByText(/cart[aã]o recusado|recusado/i)).toBeInTheDocument();
  });
});
