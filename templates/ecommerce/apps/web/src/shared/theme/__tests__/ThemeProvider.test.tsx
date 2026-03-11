import { render, screen } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeProvider';

// ── Helper component that exposes theme values via data-* attrs ─────────────
const ThemeConsumer = () => {
  const theme = useTheme();
  return (
    <div
      data-testid="consumer"
      data-primary={theme.colors.primary}
      data-store-name={theme.storeName}
    >
      consumer
    </div>
  );
};

// ── Tests ───────────────────────────────────────────────────────────────────
describe('ThemeProvider', () => {
  it('deve renderizar filhos com o tema padrão', () => {
    render(
      <ThemeProvider>
        <div>child content</div>
      </ThemeProvider>,
    );

    expect(screen.getByText('child content')).toBeInTheDocument();
  });

  it('deve sobrescrever cor primária via prop customTheme', () => {
    render(
      <ThemeProvider customTheme={{ colors: { primary: '#FF0000' } }}>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('consumer')).toHaveAttribute('data-primary', '#FF0000');
  });

  it('deve manter demais tokens intactos ao sobrescrever apenas primary', () => {
    render(
      <ThemeProvider customTheme={{ colors: { primary: '#FF0000' } }}>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    // storeName não foi alterado — mantém o default
    expect(screen.getByTestId('consumer')).toHaveAttribute('data-store-name', 'My Store');
  });

  it('deve expor tokens CSS custom properties no DOM via inline style', () => {
    const { container } = render(
      <ThemeProvider>
        <div>content</div>
      </ThemeProvider>,
    );

    // ThemeProvider envolve os filhos num <div> com CSS vars aplicadas
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.getPropertyValue('--color-primary')).not.toBe('');
  });

  it('deve lançar erro ao usar useTheme fora do ThemeProvider', () => {
    // Suppress the expected console.error from React during this test
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    const BareConsumer = () => {
      useTheme(); // deve lançar
      return <div />;
    };

    expect(() => render(<BareConsumer />)).toThrow(
      'useTheme must be used within a ThemeProvider',
    );

    consoleError.mockRestore();
  });
});
