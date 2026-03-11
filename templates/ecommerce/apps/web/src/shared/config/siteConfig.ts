/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Site Configuration — White-Label
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralizes every store-specific detail so that a new tenant only needs to
 * edit this file. Theme colors live in apps/web/src/index.css (CSS variables).
 *
 * HOW TO CUSTOMIZE:
 *  1. Change the values below to match your brand.
 *  2. Replace `logo` with an <img> path or emoji; see Layout.tsx.
 *  3. Fill in `legal.*` — Brazilian law requires CNPJ + address on invoices.
 *  4. Update `privacyEmail` with the actual DPO / privacy contact.
 */

export const siteConfig = {
  // ── Brand ──────────────────────────────────────────────────────────────────
  name: 'Minha Loja',
  tagline: 'Os melhores produtos para você',

  /** Emoji, text, or relative URL to an image (e.g. "/logo.png") */
  logo: '🛒',

  /** Canonical URL — used in legal pages and meta tags */
  url: 'https://minhaloja.com.br',

  // ── Contact ────────────────────────────────────────────────────────────────
  supportEmail: 'suporte@minhaloja.com.br',

  /** Data Protection Officer — required by LGPD art. 5, XVIII */
  privacyEmail: 'privacidade@minhaloja.com.br',

  // ── Legal (required for Brazilian e-commerce — Lei 7.962/2013) ─────────────
  legal: {
    companyName: 'Minha Loja LTDA',
    cnpj: '00.000.000/0001-00',
    address: 'Rua Exemplo, 123 — São Paulo, SP, CEP 01000-000',

    /** Date the current Terms of Service / Privacy Policy became effective */
    termsEffectiveDate: '1º de janeiro de 2025',
  },

  // ── Social ─────────────────────────────────────────────────────────────────
  social: {
    instagram: '',
    twitter: '',
    facebook: '',
    whatsapp: '',
  },

  // ── Cookie consent ─────────────────────────────────────────────────────────
  cookies: {
    /** localStorage key used to store the user's consent decision */
    storageKey: 'cookieConsent',
  },
} as const;

export type SiteConfig = typeof siteConfig;
