import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../modules/auth/useAuthStore';
import { CookieConsent } from './CookieConsent';
import { siteConfig } from '../config/siteConfig';

const link: React.CSSProperties = {
  color: 'white',
  textDecoration: 'none',
  padding: '0.3rem 0.6rem',
  borderRadius: '4px',
  fontSize: '0.95rem',
  whiteSpace: 'nowrap',
};

export function Layout() {
  const { user, accessToken, logout } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-family)' }}>
      <nav
        className="site-nav"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          background: 'var(--color-primary)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
          flexWrap: 'wrap',
        }}
      >
        <Link to="/" style={{ ...link, fontWeight: 700, fontSize: '1.15rem', marginRight: '0.5rem' }}>
          {siteConfig.logo} {siteConfig.name}
        </Link>

        <Link to="/" style={link}>
          Produtos
        </Link>

        {accessToken && (
          <>
            <Link to="/profile" style={link}>
              Meu Perfil
            </Link>
            <Link to="/orders" style={link}>
              Meus Pedidos
            </Link>
            <Link to="/checkout" style={link}>
              Checkout
            </Link>
          </>
        )}

        {user?.role === 'ADMIN' && (
          <Link to="/admin" style={{ ...link, background: 'rgba(255,255,255,0.15)' }}>
            Admin ⚙
          </Link>
        )}

        <div style={{ flex: 1 }} />

        {accessToken ? (
          <>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem' }}>
              {user?.name ?? user?.email ?? ''}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                background: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.4)',
                color: 'white',
                cursor: 'pointer',
                padding: '0.35rem 0.85rem',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-family)',
              }}
            >
              Sair
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={link}>
              Entrar
            </Link>
            <Link
              to="/register"
              style={{
                ...link,
                background: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.4)',
              }}
            >
              Cadastrar
            </Link>
          </>
        )}
      </nav>

      <main
        className="site-main"
        style={{
          flex: 1,
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        <Outlet />
      </main>

      <footer
        style={{
          textAlign: 'center',
          padding: '1.25rem 1rem',
          fontSize: '0.8rem',
          color: 'var(--color-text-muted)',
          borderTop: '1px solid #e5e7eb',
        }}
      >
        <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <Link to="/terms" style={{ color: 'inherit', textDecoration: 'underline' }}>Termos de Serviço</Link>
          <Link to="/privacy" style={{ color: 'inherit', textDecoration: 'underline' }}>Política de Privacidade</Link>
          {siteConfig.supportEmail && (
            <a href={`mailto:${siteConfig.supportEmail}`} style={{ color: 'inherit', textDecoration: 'underline' }}>Suporte</a>
          )}
        </div>
        {siteConfig.name} © {new Date().getFullYear()} — {siteConfig.legal.companyName}
      </footer>

      <CookieConsent />
    </div>
  );
}
