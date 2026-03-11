import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { type ThemeConfig } from './tokens';
import { createTheme, themeToCSSVars } from './createTheme';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ── Context ───────────────────────────────────────────────────────────────────
interface ThemeContextValue {
  theme: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────
interface ThemeProviderProps {
  children: ReactNode;
  /**
   * Partial theme overrides for white-label customisation.
   * Only the keys you provide will differ from the default theme.
   * Example: <ThemeProvider customTheme={{ colors: { primary: '#FF0000' } }}>
   */
  customTheme?: DeepPartial<ThemeConfig>;
}

export function ThemeProvider({ children, customTheme }: ThemeProviderProps) {
  const theme = useMemo(() => createTheme(customTheme), [customTheme]);
  const cssVars = useMemo(() => themeToCSSVars(theme), [theme]);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {/* The wrapper div injects all design tokens as CSS custom properties
          so every descendant can use var(--color-primary) etc. */}
      <div style={{ ...(cssVars as React.CSSProperties), background: 'var(--color-background)', color: 'var(--color-text)', fontFamily: 'var(--font-family)', minHeight: '100%' }}>{children}</div>
    </ThemeContext.Provider>
  );
}

// ── Consumer hook ─────────────────────────────────────────────────────────────
export function useTheme(): ThemeConfig {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx.theme;
}
