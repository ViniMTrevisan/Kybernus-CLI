import { useState, FormEvent } from 'react';

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => void;
  isLoading?: boolean;
  errorMessage?: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function RegisterForm({ onSubmit, isLoading = false, errorMessage }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!name.trim()) errs.name = 'Nome é obrigatório';
    if (!validateEmail(email)) errs.email = 'Email inválido';
    if (password.length < 8) errs.password = 'Mínimo de 8 caracteres';
    return errs;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    onSubmit({ name, email, password });
  }

  const fieldStyle: React.CSSProperties = { marginBottom: '1.1rem' };
  const errorStyle: React.CSSProperties = { display: 'block', marginTop: '0.3rem', fontSize: '0.8rem', color: '#ef4444' };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={fieldStyle}>
        <label htmlFor="register-name">Nome</label>
        <input
          id="register-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          placeholder="Seu nome completo"
          aria-invalid={!!errors.name}
        />
        {errors.name && <span style={errorStyle}>{errors.name}</span>}
      </div>

      <div style={fieldStyle}>
        <label htmlFor="register-email">Email</label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="seu@email.com"
          aria-invalid={!!errors.email}
        />
        {errors.email && <span style={errorStyle}>{errors.email}</span>}
      </div>

      <div style={{ ...fieldStyle, marginBottom: '1.5rem' }}>
        <label htmlFor="register-password">Senha</label>
        <input
          id="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          aria-invalid={!!errors.password}
        />
        {errors.password && <span style={errorStyle}>{errors.password}</span>}
      </div>

      {errorMessage && (
        <p role="alert" style={{ marginBottom: '1rem', padding: '0.625rem 0.75rem', background: '#fef2f2', color: '#dc2626', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
          {errorMessage}
        </p>
      )}

      <button type="submit" disabled={isLoading}>
        {isLoading && <span data-testid="spinner" aria-hidden="true" />}
        Criar conta
      </button>
    </form>
  );
}
