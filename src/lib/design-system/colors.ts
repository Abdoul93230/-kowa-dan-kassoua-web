/**
 * Charte graphique inspirée de Leboncoin
 * Configuration des couleurs principales de l'application
 */

export const colors = {
  // Couleurs principales Leboncoin
  primary: {
    orange: '#ec5a13',        // Orange principal
    orangeLight: '#ffe9de',   // Orange déteint
    white: '#ffffff',         // Blanc
    gray: '#f0f2f5',          // Gris de fond
  },

  // Variations d'orange pour différents états
  orange: {
    50: '#fff5f0',
    100: '#ffe9de',
    200: '#ffd4bd',
    300: '#ffbe9c',
    400: '#ffa87b',
    500: '#ec5a13',  // Couleur principale
    600: '#d44f11',
    700: '#b3420e',
    800: '#92360c',
    900: '#722a09',
  },

  // Échelle de gris
  gray: {
    50: '#f9fafb',
    100: '#f0f2f5',  // Couleur principale
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Couleurs sémantiques
  semantic: {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  },

  // Couleurs de texte
  text: {
    primary: '#1f2937',      // Texte principal
    secondary: '#6b7280',    // Texte secondaire
    tertiary: '#9ca3af',     // Texte tertiaire
    inverse: '#ffffff',      // Texte sur fond foncé
    orange: '#ec5a13',       // Texte orange
  },

  // Couleurs de fond
  background: {
    primary: '#ffffff',
    secondary: '#f0f2f5',
    tertiary: '#f9fafb',
    orange: '#ffe9de',
  },

  // Couleurs de bordure
  border: {
    light: '#e5e7eb',
    medium: '#d1d5db',
    dark: '#9ca3af',
    orange: '#ec5a13',
  },
} as const;

// Export des valeurs RGB pour les cas d'usage spécifiques
export const rgbColors = {
  orange: {
    primary: 'rgb(236, 90, 19)',
    light: 'rgb(255, 233, 222)',
  },
  gray: {
    primary: 'rgb(240, 242, 245)',
  },
} as const;

// Export des valeurs HSL pour les cas d'usage spécifiques
export const hslColors = {
  orange: {
    primary: 'hsl(20, 85%, 50%)',
    light: 'hsl(20, 100%, 94%)',
  },
  gray: {
    primary: 'hsl(216, 20%, 95%)',
  },
} as const;
