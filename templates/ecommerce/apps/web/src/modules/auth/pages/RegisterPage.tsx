import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { RegisterForm } from '../RegisterForm';
import { useAuthStore } from '../useAuthStore';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';

export function RegisterPage() {
  usePageTitle('Criar Conta');
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(data: { name: string; email: string; password: string }) {
    setIsLoading(true);
    setError('');
    try {
      await register(data.name, data.email, data.password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '4rem auto', padding: '2rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
      <h1 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-family)' }}>Criar conta</h1>
      <RegisterForm onSubmit={handleSubmit} isLoading={isLoading} errorMessage={error} />
      <p style={{ marginTop: '1.25rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Já tem conta?{' '}
        <Link to="/login" style={{ color: 'var(--color-primary)' }}>
          Entrar
        </Link>
      </p>
    </div>
  );
}
