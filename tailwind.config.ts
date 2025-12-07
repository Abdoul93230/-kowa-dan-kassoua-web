import type { Config } from "tailwindcss";
import { colors, fonts, spacing, borderRadius, shadows, breakpoints, zIndex } from "./src/lib/design-system";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Couleurs personnalisées Leboncoin
      colors: {
        // Couleurs principales
        primary: {
          DEFAULT: colors.primary.orange,
          light: colors.primary.orangeLight,
          white: colors.primary.white,
          gray: colors.primary.gray,
        },
        // Nuances d'orange
        orange: {
          50: colors.orange[50],
          100: colors.orange[100],
          200: colors.orange[200],
          300: colors.orange[300],
          400: colors.orange[400],
          500: colors.orange[500],
          600: colors.orange[600],
          700: colors.orange[700],
          800: colors.orange[800],
          900: colors.orange[900],
        },
        // Nuances de gris
        gray: {
          50: colors.gray[50],
          100: colors.gray[100],
          200: colors.gray[200],
          300: colors.gray[300],
          400: colors.gray[400],
          500: colors.gray[500],
          600: colors.gray[600],
          700: colors.gray[700],
          800: colors.gray[800],
          900: colors.gray[900],
        },
        // Couleurs sémantiques
        success: colors.semantic.success,
        error: colors.semantic.error,
        warning: colors.semantic.warning,
        info: colors.semantic.info,
        // Couleurs de texte
        text: {
          primary: colors.text.primary,
          secondary: colors.text.secondary,
          tertiary: colors.text.tertiary,
          inverse: colors.text.inverse,
          orange: colors.text.orange,
        },
        // Couleurs de fond
        background: {
          primary: colors.background.primary,
          secondary: colors.background.secondary,
          tertiary: colors.background.tertiary,
          orange: colors.background.orange,
        },
        // Couleurs de bordure
        border: {
          light: colors.border.light,
          medium: colors.border.medium,
          dark: colors.border.dark,
          orange: colors.border.orange,
        },
      },
      // Typographie
      fontFamily: {
        sans: fonts.family.sans.split(', '),
        mono: fonts.family.mono.split(', '),
      },
      fontSize: {
        xs: fonts.size.xs,
        sm: fonts.size.sm,
        base: fonts.size.base,
        lg: fonts.size.lg,
        xl: fonts.size.xl,
        '2xl': fonts.size['2xl'],
        '3xl': fonts.size['3xl'],
        '4xl': fonts.size['4xl'],
        '5xl': fonts.size['5xl'],
        '6xl': fonts.size['6xl'],
      },
      fontWeight: {
        normal: fonts.weight.normal,
        medium: fonts.weight.medium,
        semibold: fonts.weight.semibold,
        bold: fonts.weight.bold,
      },
      lineHeight: {
        none: fonts.lineHeight.none,
        tight: fonts.lineHeight.tight,
        snug: fonts.lineHeight.snug,
        normal: fonts.lineHeight.normal,
        relaxed: fonts.lineHeight.relaxed,
        loose: fonts.lineHeight.loose,
      },
      letterSpacing: {
        tighter: fonts.letterSpacing.tighter,
        tight: fonts.letterSpacing.tight,
        normal: fonts.letterSpacing.normal,
        wide: fonts.letterSpacing.wide,
        wider: fonts.letterSpacing.wider,
        widest: fonts.letterSpacing.widest,
      },
      // Espacements
      spacing: {
        0: spacing[0],
        1: spacing[1],
        2: spacing[2],
        3: spacing[3],
        4: spacing[4],
        5: spacing[5],
        6: spacing[6],
        8: spacing[8],
        10: spacing[10],
        12: spacing[12],
        16: spacing[16],
        20: spacing[20],
        24: spacing[24],
      },
      // Rayons de bordure
      borderRadius: {
        none: borderRadius.none,
        sm: borderRadius.sm,
        md: borderRadius.md,
        lg: borderRadius.lg,
        xl: borderRadius.xl,
        '2xl': borderRadius['2xl'],
        full: borderRadius.full,
      },
      // Ombres
      boxShadow: {
        none: shadows.none,
        sm: shadows.sm,
        md: shadows.md,
        lg: shadows.lg,
        xl: shadows.xl,
        card: shadows.card,
        hover: shadows.hover,
      },
      // Breakpoints
      screens: {
        sm: breakpoints.sm,
        md: breakpoints.md,
        lg: breakpoints.lg,
        xl: breakpoints.xl,
        '2xl': breakpoints['2xl'],
      },
      // Z-index
      zIndex: {
        0: String(zIndex.base),
        10: String(zIndex.dropdown),
        20: String(zIndex.sticky),
        30: String(zIndex.fixed),
        40: String(zIndex.modalBackdrop),
        50: String(zIndex.modal),
        60: String(zIndex.popover),
        70: String(zIndex.tooltip),
      },
    },
  },
  plugins: [],
};

export default config;
