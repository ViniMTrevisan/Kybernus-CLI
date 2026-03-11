import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';

export function ForgotPasswordPage() {
  usePageTitle('Esqueci a Senha');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { message?: string };
        throw new Error(body.message ?? 'Erro ao processar solicitação');
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar solicitação');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '4rem auto', padding: '2rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
      <h1 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-family)' }}>Recuperar senha</h1>

      {success ? (
        <div>
          <p style={{ color: '#10b981', lineHeight: 1.6 }}>
            Verifique seu email — enviamos um link para redefinir sua senha.
          </p>
          <Link
            to="/login"
            style={{ display: 'inline-block', marginTop: '1rem', color: 'var(--color-primary)', textDecoration: 'none' }}
          >
            Voltar ao login
          </Link>
        </div>
      ) : (
        <>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Informe seu email e enviaremos um link para redefinir sua senha.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: '1rem' }}>
              <label
                htmlFor="forgot-email"
                style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.875rem' }}
              >
                Email
              </label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem', boxSizing: 'border-box' }}
              />
            </div>

            {error && (
              <p role="alert" style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{ width: '100%', padding: '0.65rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}
            >
              {isLoading ? 'Enviando...' : 'Enviar link de recuperação'}
            </button>
          </form>

          <p style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
            Lembrou a senha?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)' }}>
              Entrar
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
