import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { UsersAdminPage } from '../pages/UsersAdminPage';

const mockFetch = jest.fn();
beforeAll(() => { global.fetch = mockFetch; });
beforeEach(() => mockFetch.mockClear());

function renderPage() {
  return render(
    <MemoryRouter>
      <UsersAdminPage />
    </MemoryRouter>,
  );
}

const users = [
  { id: 'u1', name: 'Alice', email: 'alice@test.com', role: 'CUSTOMER', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'u2', name: 'Bob', email: 'bob@test.com', role: 'ADMIN', createdAt: '2026-01-02T00:00:00.000Z' },
];

describe('UsersAdminPage', () => {
  it('renderiza lista de usuários com nome, email e role', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ items: users, nextCursor: null }),
    });
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('Alice')).toBeInTheDocument(),
    );
    expect(screen.getByText('alice@test.com')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getAllByText('CUSTOMER').length).toBeGreaterThanOrEqual(1);
  });

  it('exibe mensagem de vazio quando não há usuários', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ items: [], nextCursor: null }),
    });
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/nenhum usuário/i)).toBeInTheDocument(),
    );
  });

  it('filtra por role ao selecionar no dropdown', async () => {
    const user = userEvent.setup();
    // First call returns all, second (after filter) returns only CUSTOMER
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: users, nextCursor: null }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [users[0]],
          nextCursor: null,
        }),
      });
    renderPage();
    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'CUSTOMER');

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('role=CUSTOMER'),
        expect.any(Object),
      ),
    );
  });

  it('exibe erro ao falhar requisição', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole('alert')).toBeInTheDocument(),
    );
  });
});
