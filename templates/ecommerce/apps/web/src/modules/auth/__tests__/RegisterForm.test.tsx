import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from '../RegisterForm';

describe('RegisterForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('deve renderizar campos nome, email e senha', () => {
    render(<RegisterForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument();
  });

  it('deve exibir erro se senha tiver menos de 8 caracteres', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/nome/i), 'João');
    await user.type(screen.getByLabelText(/email/i), 'joao@email.com');
    await user.type(screen.getByLabelText(/^senha$/i), '123');
    await user.click(screen.getByRole('button', { name: /criar conta/i }));

    expect(await screen.findByText(/mínimo.*8 caracteres/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('deve chamar onSubmit com name, email e password ao submeter válido', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/nome/i), 'João Silva');
    await user.type(screen.getByLabelText(/email/i), 'joao@email.com');
    await user.type(screen.getByLabelText(/^senha$/i), 'senha1234');
    await user.click(screen.getByRole('button', { name: /criar conta/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'João Silva',
      email: 'joao@email.com',
      password: 'senha1234',
    });
  });

  it('deve exibir mensagem de erro da API quando errorMessage é passado', () => {
    render(<RegisterForm onSubmit={mockOnSubmit} errorMessage="Email já cadastrado" />);

    expect(screen.getByText('Email já cadastrado')).toBeInTheDocument();
  });

  it('deve mostrar spinner e desabilitar botão durante submissão', () => {
    render(<RegisterForm onSubmit={mockOnSubmit} isLoading />);

    expect(screen.getByRole('button', { name: /criar conta/i })).toBeDisabled();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
});
