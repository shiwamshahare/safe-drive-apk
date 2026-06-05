/**
 * Poppins Font Family Mapping
 * 
 * Use these font families in your StyleSheet fontWeight properties.
 * The font will automatically be applied based on fontWeight.
 */

export const FontFamily = {
  light: 'Poppins_300Light',
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
  extraBold: 'Poppins_800ExtraBold',
  black: 'Poppins_900Black',
} as const;

/**
 * Helper function to get font family based on weight
 * This allows you to use: fontFamily: getFontFamily(fontWeight)
 */
export function getFontFamily(weight?: string | number): string {
  const w = String(weight);
  
  switch (w) {
    case '300':
      return FontFamily.light;
    case '400':
    case 'normal':
    case '':
    case 'undefined':
      return FontFamily.regular;
    case '500':
      return FontFamily.medium;
    case '600':
      return FontFamily.semiBold;
    case '700':
    case 'bold':
      return FontFamily.bold;
    case '800':
      return FontFamily.extraBold;
    case '900':
      return FontFamily.black;
    default:
      return FontFamily.regular;
  }
}

/**
 * Text style presets with Poppins font
 */
export const TextPresets = {
  // Headers — refined weights for professional feel
  h1: {
    fontFamily: FontFamily.bold,
    fontSize: 32,
    lineHeight: 42,
    letterSpacing: 0.5,
  },
  h2: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    lineHeight: 34,
    letterSpacing: 0.3,
  },
  h3: {
    fontFamily: FontFamily.semiBold,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
  },
  h4: {
    fontFamily: FontFamily.semiBold,
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: 0.1,
  },
  
  // Body
  bodyLarge: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  bodySmall: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  
  // Labels
  label: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelSmall: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  
  // Buttons
  button: {
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  buttonSmall: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  
  // Caption
  caption: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  captionBold: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
  },
};
