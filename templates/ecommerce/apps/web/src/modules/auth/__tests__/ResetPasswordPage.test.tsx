import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';

const mockFetch = jest.fn();
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual<object>('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams('token=valid-reset-token-abc'), jest.fn()],
}));

beforeAll(() => { global.fetch = mockFetch; });
beforeEach(() => { mockFetch.mockClear(); mockNavigate.mockClear(); });

describe('ResetPasswordPage', () => {
  it('exibe campos nova senha e confirmação', () => {
    render(<MemoryRouter><ResetPasswordPage /></MemoryRouter>);
    expect(screen.getByLabelText(/nova senha/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar|confirmação/i)).toBeInTheDocument();
  });

  it('exibe erro se senhas não coincidirem', async () => {
    render(<MemoryRouter><ResetPasswordPage /></MemoryRouter>);

    await userEvent.type(screen.getByLabelText(/nova senha/i), 'senha1234');
    await userEvent.type(screen.getByLabelText(/confirmar|confirmação/i), 'outrasenha');
    await userEvent.click(screen.getByRole('button', { name: /redefinir|salvar/i }));

    await waitFor(() =>
      expect(screen.getByText(/senhas.*não|coincidem/i)).toBeInTheDocument(),
    );
  });

  it('chama POST /api/auth/reset-password com token da URL', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });
    render(<MemoryRouter><ResetPasswordPage /></MemoryRouter>);

    await userEvent.type(screen.getByLabelText(/nova senha/i), 'novaSenha99');
    await userEvent.type(screen.getByLabelText(/confirmar|confirmação/i), 'novaSenha99');
    await userEvent.click(screen.getByRole('button', { name: /redefinir|salvar/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/auth/reset-password',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('valid-reset-token-abc'),
        }),
      );
    });
  });

  it('redireciona para /login após reset bem-sucedido', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });
    render(<MemoryRouter><ResetPasswordPage /></MemoryRouter>);

    await userEvent.type(screen.getByLabelText(/nova senha/i), 'novaSenha99');
    await userEvent.type(screen.getByLabelText(/confirmar|confirmação/i), 'novaSenha99');
    await userEvent.click(screen.getByRole('button', { name: /redefinir|salvar/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login', expect.anything()));
  });
});
