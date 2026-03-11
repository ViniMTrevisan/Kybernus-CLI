import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { siteConfig } from '../config/siteConfig';

const STORAGE_KEY = siteConfig.cookies.storageKey;

type Consent = 'accepted' | 'declined';

function getStoredConsent(): Consent | null {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    if (val === 'accepted' || val === 'declined') return val;
    return null;
  } catch {
    return null;
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if the user hasn't decided yet
    if (getStoredConsent() === null) {
      setVisible(true);
    }
  }, []);

  function handleAccept() {
    try { localStorage.setItem(STORAGE_KEY, 'accepted'); } catch { /* private mode */ }
    setVisible(false);
  }

  function handleDecline() {
    try { localStorage.setItem(STORAGE_KEY, 'declined'); } catch { /* private mode */ }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 2000,
        background: '#1f2937',
        color: '#f9fafb',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.25)',
        fontSize: '0.875rem',
      }}
    >
      <p style={{ margin: 0, flex: 1 }}>
        🍪 Utilizamos cookies para melhorar sua experiência de navegação. Ao continuar, você concorda com
        nossa{' '}
        <Link to="/privacy" style={{ color: '#a5b4fc', textDecoration: 'underline' }}>
          Política de Privacidade
        </Link>{' '}
        e com o uso de cookies. Em conformidade com a{' '}
        <strong>LGPD (Lei 13.709/2018)</strong>.
      </p>
      <div style={{ display: 'flex', gap: '0.625rem', flexShrink: 0 }}>
        <button
          onClick={handleDecline}
          style={{
            background: 'transparent',
            border: '1px solid #4b5563',
            color: '#d1d5db',
            borderRadius: '6px',
            padding: '0.4rem 1rem',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontFamily: 'inherit',
          }}
        >
          Recusar
        </button>
        <button
          onClick={handleAccept}
          style={{
            background: '#6366f1',
            border: 'none',
            color: '#fff',
            borderRadius: '6px',
            padding: '0.4rem 1.25rem',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.8rem',
            fontFamily: 'inherit',
          }}
        >
          Aceitar
        </button>
      </div>
    </div>
  );
}
