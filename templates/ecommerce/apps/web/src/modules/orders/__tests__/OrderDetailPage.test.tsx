import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { OrderDetailPage } from '../pages/OrderDetailPage';

const mockFetch = jest.fn();
beforeAll(() => { global.fetch = mockFetch; });
beforeEach(() => mockFetch.mockClear());

function renderPage(orderId = 'test-order-id') {
  return render(
    <MemoryRouter initialEntries={[`/orders/${orderId}`]}>
      <Routes>
        <Route path="/orders/:id" element={<OrderDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

const baseOrder = {
  id: 'test-order-id',
  status: 'PAID',
  total: 150,
  subtotal: 150,
  discount: 0,
  shippingCost: 0,
  trackingCode: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  items: [
    { id: 'i1', name: 'Camiseta Azul', qty: 2, price: 75, sku: 'CAM-1', productId: 'p1', variantId: 'v1', image: null },
  ],
};

describe('OrderDetailPage', () => {
  it('exibe estado de carregamento inicialmente', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
  });

  it('renderiza detalhes do pedido (itens, total, status)', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => baseOrder,
    });
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/camiseta azul/i)).toBeInTheDocument(),
    );
    expect(screen.getByText('PAID')).toBeInTheDocument();
    expect(screen.getByText(/150/)).toBeInTheDocument();
  });

  it('exibe trackingCode quando status é SHIPPED', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        ...baseOrder,
        status: 'SHIPPED',
        trackingCode: 'BR123456789',
      }),
    });
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/BR123456789/)).toBeInTheDocument(),
    );
  });

  it('exibe mensagem de erro quando pedido não é encontrado (404)', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404 });
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole('alert')).toBeInTheDocument(),
    );
  });
});
