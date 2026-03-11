import { Link } from 'react-router-dom';
import { siteConfig } from '../config/siteConfig';

export function NotFoundPage() {
  return (
    <main
      style={{
        textAlign: 'center',
        padding: '5rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      <p style={{ fontSize: '6rem', lineHeight: 1, fontWeight: 800, color: '#e5e7eb' }}>
        404
      </p>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>
        Página não encontrada
      </h1>
      <p style={{ color: '#6b7280', maxWidth: '360px' }}>
        O endereço que você tentou acessar não existe ou foi removido.
      </p>
      <Link
        to="/"
        style={{
          marginTop: '0.5rem',
          background: 'var(--color-primary)',
          color: '#fff',
          textDecoration: 'none',
          padding: '0.6rem 1.5rem',
          borderRadius: '6px',
          fontWeight: 600,
          fontSize: '0.9rem',
        }}
      >
        Voltar para {siteConfig.name}
      </Link>
    </main>
  );
}
