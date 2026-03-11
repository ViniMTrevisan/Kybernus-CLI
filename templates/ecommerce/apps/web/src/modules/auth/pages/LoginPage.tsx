import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LoginForm } from '../LoginForm';
import { useAuthStore } from '../useAuthStore';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';

export function LoginPage() {
  usePageTitle('Entrar');
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(data: { email: string; password: string }) {
    setIsLoading(true);
    setError('');
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '4rem auto', padding: '2rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
      <h1 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-family)' }}>Entrar</h1>
      <LoginForm onSubmit={handleSubmit} isLoading={isLoading} errorMessage={error} />
      <p style={{ marginTop: '1.25rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Não tem conta?{' '}
        <Link to="/register" style={{ color: 'var(--color-primary)' }}>
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}
