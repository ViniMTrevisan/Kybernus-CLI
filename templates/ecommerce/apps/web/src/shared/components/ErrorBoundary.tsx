import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary] Unhandled render error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

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
          <p style={{ fontSize: '3rem', lineHeight: 1 }}>⚠️</p>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827' }}>
            Algo deu errado
          </h1>
          <p style={{ color: '#6b7280', maxWidth: '400px', fontSize: '0.9rem' }}>
            Ocorreu um erro inesperado. Tente recarregar a página ou voltar ao início.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={this.handleReset}
              style={{
                background: 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                padding: '0.6rem 1.5rem',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              Tentar novamente
            </button>
            <a
              href="/"
              style={{
                background: 'transparent',
                border: '1px solid #d1d5db',
                color: '#374151',
                padding: '0.6rem 1.5rem',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.9rem',
                textDecoration: 'none',
              }}
            >
              Ir para o início
            </a>
          </div>
          {import.meta.env.DEV && this.state.error && (
            <pre
              style={{
                marginTop: '1.5rem',
                textAlign: 'left',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                padding: '1rem',
                fontSize: '0.75rem',
                color: '#991b1b',
                maxWidth: '600px',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {this.state.error.message}
            </pre>
          )}
        </main>
      );
    }

    return this.props.children;
  }
}
