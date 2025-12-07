/**
 * Charte typographique inspirée de Leboncoin
 * Configuration des polices et tailles de texte
 */

// Leboncoin utilise principalement la police "Noto Sans" avec des variations
export const fonts = {
  // Famille de polices
  family: {
    sans: [
      'var(--font-sans)',
      'Noto Sans',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ].join(', '),
    mono: [
      'var(--font-mono)',
      'ui-monospace',
      'SFMono-Regular',
      'Consolas',
      'monospace',
    ].join(', '),
  },

  // Tailles de police (inspirées de Leboncoin)
  size: {
    xs: '0.75rem',      // 12px - Très petit texte
    sm: '0.875rem',     // 14px - Petit texte, labels
    base: '1rem',       // 16px - Texte de base
    lg: '1.125rem',     // 18px - Texte légèrement plus grand
    xl: '1.25rem',      // 20px - Sous-titres
    '2xl': '1.5rem',    // 24px - Titres petits
    '3xl': '1.875rem',  // 30px - Titres moyens
    '4xl': '2.25rem',   // 36px - Grands titres
    '5xl': '3rem',      // 48px - Très grands titres
    '6xl': '3.75rem',   // 60px - Titres hero
  },

  // Poids des polices
  weight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Hauteurs de ligne
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // Espacement des lettres
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// Styles de texte prédéfinis (comme sur Leboncoin)
export const textStyles = {
  // Titres
  h1: {
    fontSize: fonts.size['4xl'],
    fontWeight: fonts.weight.bold,
    lineHeight: fonts.lineHeight.tight,
  },
  h2: {
    fontSize: fonts.size['3xl'],
    fontWeight: fonts.weight.bold,
    lineHeight: fonts.lineHeight.tight,
  },
  h3: {
    fontSize: fonts.size['2xl'],
    fontWeight: fonts.weight.semibold,
    lineHeight: fonts.lineHeight.snug,
  },
  h4: {
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.semibold,
    lineHeight: fonts.lineHeight.snug,
  },
  h5: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.semibold,
    lineHeight: fonts.lineHeight.normal,
  },
  h6: {
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
    lineHeight: fonts.lineHeight.normal,
  },

  // Corps de texte
  body: {
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.normal,
    lineHeight: fonts.lineHeight.normal,
  },
  bodySmall: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.normal,
    lineHeight: fonts.lineHeight.normal,
  },
  bodyLarge: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.normal,
    lineHeight: fonts.lineHeight.relaxed,
  },

  // Éléments spéciaux
  button: {
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
    lineHeight: fonts.lineHeight.none,
  },
  label: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.medium,
    lineHeight: fonts.lineHeight.normal,
  },
  caption: {
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.normal,
    lineHeight: fonts.lineHeight.normal,
  },
  price: {
    fontSize: fonts.size['2xl'],
    fontWeight: fonts.weight.bold,
    lineHeight: fonts.lineHeight.tight,
  },
} as const;

export type TextStyle = keyof typeof textStyles;
