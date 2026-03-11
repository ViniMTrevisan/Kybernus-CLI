import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { OrderHistoryPage } from '../pages/OrderHistoryPage';

const mockFetch = jest.fn();
beforeAll(() => { global.fetch = mockFetch; });
beforeEach(() => mockFetch.mockClear());

function renderPage() {
  return render(
    <MemoryRouter>
      <OrderHistoryPage />
    </MemoryRouter>,
  );
}

describe('OrderHistoryPage', () => {
  it('exibe estado de carregamento inicialmente', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
  });

  it('renderiza lista de pedidos com status badge', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          {
            id: 'order-abc-1',
            status: 'PAID',
            total: 100,
            createdAt: '2026-01-01T00:00:00.000Z',
            items: [],
          },
        ],
        nextCursor: null,
      }),
    });
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/order-abc-1/i)).toBeInTheDocument(),
    );
    expect(screen.getByText('PAID')).toBeInTheDocument();
  });

  it('exibe mensagem de vazio quando não há pedidos', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ items: [], nextCursor: null }),
    });
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/nenhum pedido/i)).toBeInTheDocument(),
    );
  });

  it('cada pedido tem link para /orders/:id', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          {
            id: 'order-id-1',
            status: 'PENDING',
            total: 50,
            createdAt: '2026-01-01T00:00:00.000Z',
            items: [],
          },
        ],
        nextCursor: null,
      }),
    });
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole('link')).toHaveAttribute('href', '/orders/order-id-1'),
    );
  });

  it('exibe mensagem de erro em caso de falha na requisição', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 401 });
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole('alert')).toBeInTheDocument(),
    );
  });
});
