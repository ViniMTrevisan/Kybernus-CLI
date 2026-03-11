/**
 * CheckoutPage — Frontend Tests
 * Stripe Elements are fully mocked.
 */

jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PaymentElement: () => <div data-testid="payment-element">PaymentElement mock</div>,
  useStripe: () => mockStripe,
  useElements: () => mockElements,
}));

jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn().mockResolvedValue({}),
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { CheckoutPage } from '../pages/CheckoutPage';

const mockConfirmPayment = jest.fn();
const mockStripe = {
  confirmPayment: mockConfirmPayment,
};
const mockElements = {};

// Cart summary fixture
const mockCart = {
  items: [{ variantId: 'v1', productId: 'p1', name: 'Camiseta', sku: 'CAM-P', price: 99.9, qty: 2, image: null }],
  subtotal: 199.8,
  discount: 0,
  total: 218.3,
  couponCode: null,
};

jest.mock('../hooks/useCheckout', () => ({
  useCheckout: () => ({
    cart: mockCart,
    checkout: mockCheckout,
    isLoading: false,
    error: null,
  }),
}));

const mockCheckout = jest.fn();

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/checkout']}>
      <Routes>
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout/success" element={<div>Sucesso!</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

async function advanceToPayment(user: ReturnType<typeof userEvent.setup>) {
  fireEvent.change(screen.getByLabelText(/rua|endere[çc]o/i), { target: { value: 'Rua das Flores, 100' } });
  fireEvent.change(screen.getByLabelText(/cep/i), { target: { value: '01310-100' } });
  await user.click(screen.getByRole('button', { name: /pr[oó]ximo|avan[çc]ar|continuar/i }));
  await waitFor(() => screen.getByText(/frete/i));
  await user.click(screen.getByRole('button', { name: /pr[oó]ximo|avan[çc]ar|continuar/i }));
  await waitFor(() => screen.getByTestId('payment-element'));
}

describe('CheckoutPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve exibir resumo do carrinho', () => {
    renderPage();
    expect(screen.getByText('Camiseta')).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*199[,.]?8/)).toBeInTheDocument();
  });

  it('deve progredir pelo stepper: Endereço → Frete → Pagamento', async () => {
    renderPage();
    const user = userEvent.setup();

    // Should start on Endereço step
    expect(screen.getByText(/endere[çc]o/i)).toBeInTheDocument();

    // Fill address and advance
    fireEvent.change(screen.getByLabelText(/rua|endere[çc]o/i), { target: { value: 'Rua das Flores, 100' } });
    fireEvent.change(screen.getByLabelText(/cep/i), { target: { value: '01310-100' } });
    await user.click(screen.getByRole('button', { name: /pr[oó]ximo|avan[çc]ar|continuar/i }));

    // Frete step
    await waitFor(() => expect(screen.getByText(/frete/i)).toBeInTheDocument());
  });

  it('deve renderizar o PaymentElement no step de Pagamento', async () => {
    mockCheckout.mockResolvedValue({ orderId: 'ord-0', clientSecret: 'pi_secret_0' });
    renderPage();
    const user = userEvent.setup();
    await advanceToPayment(user);
    expect(screen.getByTestId('payment-element')).toBeInTheDocument();
  });

  it('deve redirecionar para /checkout/success após pagamento confirmado', async () => {
    mockCheckout.mockResolvedValue({ orderId: 'ord-1', clientSecret: 'pi_secret_1' });
    mockConfirmPayment.mockResolvedValue({ error: undefined });

    renderPage();
    const user = userEvent.setup();
    await advanceToPayment(user);

    // Submit payment
    await user.click(screen.getByRole('button', { name: /confirmar pagamento/i }));

    await waitFor(() => expect(screen.getByText('Sucesso!')).toBeInTheDocument());
  });

  it('deve exibir erro se Stripe retornar erro de pagamento', async () => {
    mockCheckout.mockResolvedValue({ orderId: 'ord-2', clientSecret: 'pi_secret_2' });
    mockConfirmPayment.mockResolvedValue({
      error: { code: 'card_declined', message: 'Cartão recusado.' },
    });

    renderPage();
    const user = userEvent.setup();
    await advanceToPayment(user);
    await user.click(screen.getByRole('button', { name: /confirmar pagamento/i }));

    await waitFor(() => expect(screen.getByText(/cart[aã]o recusado/i)).toBeInTheDocument());
  });

  it('deve exibir BoletoWaiting quando Stripe retornar boleto_display_details', async () => {
    mockCheckout.mockResolvedValue({ orderId: 'ord-3', clientSecret: 'pi_secret_3' });
    mockConfirmPayment.mockResolvedValue({
      error: undefined,
      paymentIntent: {
        status: 'requires_action',
        next_action: {
          type: 'boleto_display_details',
          boleto_display_details: {
            expires_after: Math.floor(Date.now() / 1000) + 3 * 24 * 3600,
            hosted_voucher_url: 'https://payments.stripe.com/boleto/voucher',
            number: '23793.38128 60007.827136 96000.063305 4 94190000050000',
            pdf: 'https://payments.stripe.com/boleto/pdf',
          },
        },
      },
    });

    renderPage();
    const user = userEvent.setup();
    await advanceToPayment(user);
    await user.click(screen.getByRole('button', { name: /confirmar pagamento/i }));

    await waitFor(() => expect(screen.getByText(/boleto gerado/i)).toBeInTheDocument());
    expect(screen.getByText(/3 dias úteis/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ver.*imprimir boleto/i })).toBeInTheDocument();
  });
});
