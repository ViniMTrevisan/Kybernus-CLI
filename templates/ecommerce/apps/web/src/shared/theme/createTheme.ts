import { ThemeConfig, defaultTheme } from './tokens';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Merges user overrides with the default theme.
 * Only the top-level and second-level keys are merged (deep enough for the
 * current data shape; extend if nesting grows).
 */
export function createTheme(overrides: DeepPartial<ThemeConfig> = {}): ThemeConfig {
  return {
    ...defaultTheme,
    ...overrides,
    colors: { ...defaultTheme.colors, ...overrides.colors },
    typography: {
      ...defaultTheme.typography,
      ...overrides.typography,
      fontSize: {
        ...defaultTheme.typography.fontSize,
        ...overrides.typography?.fontSize,
      },
    },
    borderRadius: { ...defaultTheme.borderRadius, ...overrides.borderRadius },
    logo: { ...defaultTheme.logo, ...overrides.logo },
  };
}

/**
 * Converts a ThemeConfig into a flat map of CSS custom properties.
 * The result can be spread onto an element's inline style to expose
 * the full design token set to all descendant components via var().
 */
export function themeToCSSVars(theme: ThemeConfig): Record<string, string> {
  return {
    '--color-primary': theme.colors.primary,
    '--color-secondary': theme.colors.secondary,
    '--color-accent': theme.colors.accent,
    '--color-background': theme.colors.background,
    '--color-surface': theme.colors.surface,
    '--color-error': theme.colors.error,
    '--color-text': theme.colors.text,
    '--color-text-muted': theme.colors.textMuted,
    '--font-family': theme.typography.fontFamily,
    '--font-size-xs': theme.typography.fontSize.xs,
    '--font-size-sm': theme.typography.fontSize.sm,
    '--font-size-base': theme.typography.fontSize.base,
    '--font-size-lg': theme.typography.fontSize.lg,
    '--font-size-xl': theme.typography.fontSize.xl,
    '--font-size-2xl': theme.typography.fontSize['2xl'],
    '--font-size-3xl': theme.typography.fontSize['3xl'],
    '--border-radius-sm': theme.borderRadius.sm,
    '--border-radius-md': theme.borderRadius.md,
    '--border-radius-lg': theme.borderRadius.lg,
    '--border-radius-full': theme.borderRadius.full,
  };
}
