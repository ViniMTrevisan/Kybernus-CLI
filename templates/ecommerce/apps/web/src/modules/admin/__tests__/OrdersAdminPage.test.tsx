import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { OrdersAdminPage } from '../pages/OrdersAdminPage';

const mockFetch = jest.fn();
beforeAll(() => { global.fetch = mockFetch; });
beforeEach(() => mockFetch.mockClear());

function renderPage() {
  return render(
    <MemoryRouter>
      <OrdersAdminPage />
    </MemoryRouter>,
  );
}

const orders = [
  {
    id: 'ord-1',
    userId: 'u1',
    status: 'PAID',
    total: 199.9,
    trackingCode: null,
    createdAt: new Date().toISOString(),
    items: [],
  },
  {
    id: 'ord-2',
    userId: 'u2',
    status: 'SHIPPED',
    total: 89.5,
    trackingCode: 'BR123456789',
    createdAt: new Date().toISOString(),
    items: [],
  },
];

describe('OrdersAdminPage', () => {
  it('renderiza lista de pedidos com status badge', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ items: orders, nextCursor: null }),
    });
    renderPage();
    await waitFor(() => expect(screen.getByText('ord-1')).toBeInTheDocument());
    expect(screen.getByText('ord-2')).toBeInTheDocument();
    expect(screen.getAllByText('PAID').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('SHIPPED').length).toBeGreaterThanOrEqual(1);
  });

  it('permite filtrar por status', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ items: orders, nextCursor: null }),
    });
    renderPage();
    await waitFor(() => expect(screen.getByText('ord-1')).toBeInTheDocument());

    const select = screen.getByRole('combobox', { name: /filtrar|status/i });
    expect(select).toBeInTheDocument();
    await user.selectOptions(select, 'PAID');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('exibe select para atualizar status de um pedido', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ items: orders, nextCursor: null }),
    });
    renderPage();
    await waitFor(() => expect(screen.getByText('ord-1')).toBeInTheDocument());

    // Should have selects for updating order status (one per order)
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(2); // filter + at least one row select
  });
});
