import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../LoginForm';

describe('LoginForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('deve renderizar campos email e senha', () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('deve exibir erro de validação se email for inválido ao submeter', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'email-invalido');
    await user.type(screen.getByLabelText(/senha/i), 'senha1234');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByText(/email inválido/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('deve exibir erro se senha for vazia ao submeter', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'joao@email.com');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByText(/senha.*obrigatória/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('deve chamar onSubmit com email e senha ao submeter formulário válido', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'joao@email.com');
    await user.type(screen.getByLabelText(/senha/i), 'senha1234');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      email: 'joao@email.com',
      password: 'senha1234',
    });
  });

  it('deve mostrar spinner e desabilitar botão durante submissão (isLoading=true)', () => {
    render(<LoginForm onSubmit={mockOnSubmit} isLoading />);

    const button = screen.getByRole('button', { name: /entrar/i });
    expect(button).toBeDisabled();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('deve exibir mensagem de erro da API quando errorMessage é passado', () => {
    render(<LoginForm onSubmit={mockOnSubmit} errorMessage="Credenciais inválidas" />);

    expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument();
  });

  it('deve ter campo senha do tipo password (não visível)', () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/senha/i)).toHaveAttribute('type', 'password');
  });
});
