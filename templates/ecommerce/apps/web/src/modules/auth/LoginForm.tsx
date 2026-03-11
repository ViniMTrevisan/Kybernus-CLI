import { useState, FormEvent } from 'react';

export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  isLoading?: boolean;
  errorMessage?: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function LoginForm({ onSubmit, isLoading = false, errorMessage }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!validateEmail(email)) errs.email = 'Email inválido';
    if (!password) errs.password = 'Senha é obrigatória';
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
    onSubmit({ email, password });
  }

  const fieldStyle: React.CSSProperties = { marginBottom: '1.1rem' };
  const errorStyle: React.CSSProperties = { display: 'block', marginTop: '0.3rem', fontSize: '0.8rem', color: '#ef4444' };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={fieldStyle}>
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
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
        <label htmlFor="login-password">Senha</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          placeholder="••••••••"
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
        Entrar
      </button>
    </form>
  );
}
