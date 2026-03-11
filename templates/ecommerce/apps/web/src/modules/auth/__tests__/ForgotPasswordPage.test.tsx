import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';

const mockFetch = jest.fn();
beforeAll(() => { global.fetch = mockFetch; });
beforeEach(() => mockFetch.mockClear());

describe('ForgotPasswordPage', () => {
  it('exibe campo de email', () => {
    render(<MemoryRouter><ForgotPasswordPage /></MemoryRouter>);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('chama POST /api/auth/forgot-password ao submeter', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });
    render(<MemoryRouter><ForgotPasswordPage /></MemoryRouter>);

    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    await userEvent.click(screen.getByRole('button', { name: /enviar|recuperar/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/auth/forgot-password',
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });

  it('exibe mensagem de sucesso após submissão', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });
    render(<MemoryRouter><ForgotPasswordPage /></MemoryRouter>);

    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    await userEvent.click(screen.getByRole('button', { name: /enviar|recuperar/i }));

    await waitFor(() =>
      expect(screen.getByText(/verifique|enviamos|email/i)).toBeInTheDocument(),
    );
  });
});
