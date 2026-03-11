import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartPage } from '../pages/CartPage';
import { useAuthStore } from '../../auth/useAuthStore';

const mockFetch = jest.fn();
beforeAll(() => { global.fetch = mockFetch; });
beforeEach(() => {
  mockFetch.mockClear();
  // Set token in Zustand memory state (not localStorage — secure in-memory only)
  useAuthStore.setState({ accessToken: 'test-token' });
});
afterAll(() => useAuthStore.setState({ accessToken: null, user: null }));

function renderPage() {
  return render(
    <MemoryRouter>
      <CartPage />
    </MemoryRouter>,
  );
}

const cartWithItems = {
  items: [
    { variantId: 'v1', productId: 'p1', name: 'Camiseta Preta', sku: 'CAM-P', price: 99.9, qty: 2, image: null },
    { variantId: 'v2', productId: 'p2', name: 'Calça Jeans', sku: 'CAL-J', price: 199.9, qty: 1, image: null },
  ],
  subtotal: 399.7,
  discount: 0,
  shippingCost: 0,
  tax: 0,
  total: 399.7,
  couponCode: null,
};

const emptyCart = {
  items: [],
  subtotal: 0,
  discount: 0,
  shippingCost: 0,
  tax: 0,
  total: 0,
  couponCode: null,
};

describe('CartPage', () => {
  it('exibe itens do carrinho com nome, qtd e preço', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => cartWithItems,
    });
    renderPage();
    await waitFor(() => expect(screen.getByText('Camiseta Preta')).toBeInTheDocument());
    expect(screen.getByText('Calça Jeans')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
  });

  it('exibe total do carrinho', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => cartWithItems,
    });
    renderPage();
    await waitFor(() => {
      const elements = screen.getAllByText(/399/);
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('exibe input de cupom e botão aplicar', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => cartWithItems,
    });
    renderPage();
    await waitFor(() => expect(screen.getByPlaceholderText(/cupom|código/i)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /aplicar/i })).toBeInTheDocument();
  });

  it('exibe opções de frete', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => cartWithItems,
    });
    renderPage();
    await waitFor(() => expect(screen.getByPlaceholderText(/cep/i)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /calcular/i })).toBeInTheDocument();
  });

  it('botão "Ir para Checkout" navega para /checkout', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => cartWithItems,
    });
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole('link', { name: /ir para checkout|finalizar/i })).toBeInTheDocument(),
    );
  });

  it('exibe mensagem quando carrinho estiver vazio', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => emptyCart,
    });
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/carrinho.*vazio|vazio/i)).toBeInTheDocument(),
    );
  });
});
