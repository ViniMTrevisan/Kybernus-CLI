import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ProfilePage } from '../pages/ProfilePage';
import { useAuthStore } from '../../auth/useAuthStore';

const mockFetch = jest.fn();
beforeAll(() => {
  global.fetch = mockFetch;
});
beforeEach(() => {
  mockFetch.mockClear();
  useAuthStore.setState({
    accessToken: 'test-token',
    user: { id: 'user-1', name: 'Test User', email: 'test@email.com', role: 'CUSTOMER' },
  });
});
afterAll(() => useAuthStore.setState({ accessToken: null, user: null }));

function renderPage() {
  return render(
    <MemoryRouter>
      <ProfilePage />
    </MemoryRouter>,
  );
}

describe('ProfilePage', () => {
  // ── Rendering ─────────────────────────────────────────────────────────────
  it('renderiza campos com os dados do usuário preenchidos', () => {
    renderPage();

    expect(screen.getByLabelText(/nome/i)).toHaveValue('Test User');
    expect(screen.getByLabelText(/^email$/i)).toHaveValue('test@email.com');
  });

  it('exibe a seção de zona de perigo', () => {
    renderPage();
    expect(screen.getByText(/zona de perigo/i)).toBeInTheDocument();
  });

  // ── Update profile ────────────────────────────────────────────────────────
  it('atualiza dados pessoais com sucesso', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'user-1',
        name: 'Novo Nome',
        email: 'test@email.com',
        role: 'CUSTOMER',
      }),
    });

    renderPage();

    const nameInput = screen.getByLabelText(/nome/i);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Novo Nome');
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/sucesso/i),
    );
    expect(mockFetch).toHaveBeenCalledWith('/api/me', expect.objectContaining({ method: 'PATCH' }));
  });

  it('exibe mensagem de erro quando atualização falha', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ message: 'Email já está em uso' }),
    });

    renderPage();

    await userEvent.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toBeInTheDocument(),
    );
  });

  // ── Change password ───────────────────────────────────────────────────────
  it('troca a senha com sucesso', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });

    renderPage();

    await userEvent.type(screen.getByLabelText(/senha atual/i), 'senha1234');
    await userEvent.type(screen.getByLabelText(/^nova senha$/i), 'novasenha5678');
    await userEvent.type(screen.getByLabelText(/confirmar nova senha/i), 'novasenha5678');
    await userEvent.click(screen.getByRole('button', { name: /alterar senha/i }));

    await waitFor(() =>
      expect(screen.getByText(/sucesso/i)).toBeInTheDocument(),
    );
    expect(mockFetch).toHaveBeenCalledWith('/api/me/password', expect.objectContaining({ method: 'PATCH' }));
  });

  it('exibe erro quando senhas novas não coincidem', async () => {
    renderPage();

    await userEvent.type(screen.getByLabelText(/senha atual/i), 'senha1234');
    await userEvent.type(screen.getByLabelText(/^nova senha$/i), 'novasenha5678');
    await userEvent.type(screen.getByLabelText(/confirmar nova senha/i), 'outrasenha');
    await userEvent.click(screen.getByRole('button', { name: /alterar senha/i }));

    await waitFor(() =>
      expect(screen.getByText(/não coincidem/i)).toBeInTheDocument(),
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });

  // ── Delete account ────────────────────────────────────────────────────────
  it('abre o modal de confirmação ao clicar em excluir minha conta', async () => {
    renderPage();

    await userEvent.click(screen.getByRole('button', { name: /excluir minha conta/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/senha para confirmar exclusão/i)).toBeInTheDocument();
  });

  it('fecha o modal ao clicar em cancelar', async () => {
    renderPage();

    await userEvent.click(screen.getByRole('button', { name: /excluir minha conta/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('exclui a conta com a senha correta e redireciona', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });

    renderPage();

    await userEvent.click(screen.getByRole('button', { name: /excluir minha conta/i }));
    await userEvent.type(screen.getByLabelText(/senha para confirmar exclusão/i), 'senha1234');
    await userEvent.click(screen.getByRole('button', { name: /^excluir conta$/i }));

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith('/api/me', expect.objectContaining({ method: 'DELETE' })),
    );
  });
});
