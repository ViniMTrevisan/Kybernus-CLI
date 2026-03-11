import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CouponsAdminPage } from '../pages/CouponsAdminPage';

const mockFetch = jest.fn();
beforeAll(() => { global.fetch = mockFetch; });
beforeEach(() => mockFetch.mockClear());

function renderPage() {
  return render(
    <MemoryRouter>
      <CouponsAdminPage />
    </MemoryRouter>,
  );
}

const coupons = [
  {
    id: 'coup-1',
    code: 'PROMO10',
    discountType: 'percent',
    discountValue: 10,
    minOrderValue: 0,
    usageLimit: 100,
    usageCount: 5,
    expiresAt: null,
  },
  {
    id: 'coup-2',
    code: 'FIXED20',
    discountType: 'fixed',
    discountValue: 20,
    minOrderValue: 50,
    usageLimit: null,
    usageCount: 0,
    expiresAt: null,
  },
];

describe('CouponsAdminPage', () => {
  it('renderiza tabela com código, desconto e limite', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: coupons }),
    } as Response);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('PROMO10')).toBeInTheDocument();
      expect(screen.getByText('FIXED20')).toBeInTheDocument();
    });

    expect(screen.getByText('10%')).toBeInTheDocument();
    expect(screen.getByText('R$ 20,00')).toBeInTheDocument();
  });

  it('formulário de criação chama POST /api/admin/coupons', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'coup-new',
          code: 'NEWCOUPON',
          discountType: 'percent',
          discountValue: 5,
          minOrderValue: 0,
          usageLimit: null,
          usageCount: 0,
          expiresAt: null,
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      } as Response);

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /criar|novo/i })).toBeInTheDocument();
    });

    await userEvent.type(screen.getByLabelText(/código/i), 'NEWCOUPON');
    await userEvent.type(screen.getByLabelText(/valor/i), '5');
    await userEvent.click(screen.getByRole('button', { name: /criar|novo/i }));

    await waitFor(() => {
      const calls = mockFetch.mock.calls;
      const postCall = calls.find(
        (c) => typeof c[0] === 'string' && c[0].includes('/api/admin/coupons') && c[1]?.method === 'POST',
      );
      expect(postCall).toBeDefined();
    });
  });

  it('botão deletar chama DELETE /api/admin/coupons/:id', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [coupons[0]] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
        status: 204,
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      } as Response);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('PROMO10')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /excluir|remover|deletar/i }));

    await waitFor(() => {
      const calls = mockFetch.mock.calls;
      const deleteCall = calls.find(
        (c) => typeof c[0] === 'string' && c[0].includes('/api/admin/coupons/coup-1') && c[1]?.method === 'DELETE',
      );
      expect(deleteCall).toBeDefined();
    });
  });
});
