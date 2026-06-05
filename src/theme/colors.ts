/**
 * SafeDrive Color Palette
 * Supports system theme detection (light & dark mode).
 *
 * ALL colors in the app should reference `theme.xxx` from this file.
 * Never hardcode hex values in components or screens.
 */
import { StyleSheet, Appearance } from 'react-native';
import { FontFamily } from './fonts';

const darkPalette = {
  background: '#0D1117',
  surface: '#161B22',
  surfaceElevated: '#1C2128',
  card: '#161B22',
  cardAlt: '#1C2128',

  text: '#E6EDF3',
  textSecondary: '#8B949E',
  textMuted: '#484F58',
  textLight: '#E6EDF3',

  // Brand — Steel blue accent
  primary: '#58A6FF',
  primaryDark: '#388BFD',
  primaryLight: '#79C0FF',
  primaryBorder: '#58A6FF',

  // Accent variants
  accent: '#58A6FF',
  accentLight: '#79C0FF',
  accentMuted: '#1F3A5F',

  // Event accent colors
  accentOrange: '#F0883E',
  accentPurple: '#BC8CFF',
  accentCoral: '#FF7B72',

  // Status colors
  green: '#3FB950',
  greenBg: '#0D2117',
  red: '#F85149',
  yellow: '#D29922',
  black: '#010409',

  // Ratings
  excellent: '#3FB950',
  good: '#58A6FF',
  fair: '#D29922',
  poor: '#F85149',

  // Borders & dividers
  border: '#21262D',
  borderStrong: '#30363D',
  divider: '#21262D',

  // Inputs
  inputBg: '#161B22',
  inputBorder: '#30363D',

  // Chips / categories
  chipBg: '#1C2128',
  chipBorder: '#30363D',
  chipActiveBg: '#58A6FF',

  // Icons & misc
  iconBg: '#1C2128',
  searchBg: '#161B22',
  tabBar: '#0D1117',
  tabBarBorder: '#21262D',
  shadow: '#010409',
  overlay: 'rgba(1,4,9,0.80)',
  statusBar: 'light' as const,

  // Error
  error: '#F85149',
  errorBg: '#2D1115',
};

const lightPalette = {
  background: '#F6F8FA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  card: '#FFFFFF',
  cardAlt: '#F6F8FA',

  text: '#1F2328',
  textSecondary: '#57606A',
  textMuted: '#8C959F',
  textLight: '#FFFFFF',

  primary: '#0969DA',
  primaryDark: '#0A3069',
  primaryLight: '#54AEFF',
  primaryBorder: '#0969DA',

  accent: '#0969DA',
  accentLight: '#54AEFF',
  accentMuted: '#DDF4FF',

  accentOrange: '#DF6300',
  accentPurple: '#8250DF',
  accentCoral: '#CF222E',

  green: '#1A7F37',
  greenBg: '#DAFBE1',
  red: '#CF222E',
  yellow: '#9A6700',
  black: '#1F2328',

  excellent: '#1A7F37',
  good: '#0969DA',
  fair: '#9A6700',
  poor: '#CF222E',

  border: '#D0D7DE',
  borderStrong: '#8C959F',
  divider: '#D0D7DE',

  inputBg: '#FFFFFF',
  inputBorder: '#D0D7DE',

  chipBg: '#EFF2F5',
  chipBorder: '#D0D7DE',
  chipActiveBg: '#0969DA',

  iconBg: '#EFF2F5',
  searchBg: '#EFF2F5',
  tabBar: '#FFFFFF',
  tabBarBorder: '#D0D7DE',
  shadow: '#8C959F',
  overlay: 'rgba(31,35,40,0.40)',
  statusBar: 'dark' as const,

  error: '#CF222E',
  errorBg: '#FFEBE9',
};

export const Colors = {
  light: lightPalette,
  dark: darkPalette,
};

export type ThemeColors = typeof darkPalette;

// Find which theme key a color value belongs to
const findThemeKey = (value: any): keyof ThemeColors | null => {
  if (typeof value !== 'string') return null;
  const valLower = value.toLowerCase();
  
  // Try to find matching value in dark palette
  const key = Object.keys(darkPalette).find(
    (k) => darkPalette[k as keyof ThemeColors].toLowerCase() === valLower
  );
  if (key) return key as keyof ThemeColors;

  // Try light palette as fallback
  const fallbackKey = Object.keys(lightPalette).find(
    (k) => lightPalette[k as keyof ThemeColors].toLowerCase() === valLower
  );
  return (fallbackKey as keyof ThemeColors) || null;
};

// Override StyleSheet.create to dynamically resolve colors based on active color scheme
const originalCreate = StyleSheet.create;
StyleSheet.create = (styles: any): any => {
  const resolvedStyles: any = {};

  Object.keys(styles).forEach((styleKey) => {
    const styleObj = styles[styleKey];
    if (!styleObj || typeof styleObj !== 'object') {
      resolvedStyles[styleKey] = styleObj;
      return;
    }

    const dynamicStyle = {};
    Object.keys(styleObj).forEach((propKey) => {
      const propVal = styleObj[propKey];
      const themeKey = findThemeKey(propVal);

      if (themeKey) {
        Object.defineProperty(dynamicStyle, propKey, {
          get() {
            const scheme = Appearance.getColorScheme();
            return scheme === 'light' ? lightPalette[themeKey] : darkPalette[themeKey];
          },
          enumerable: true,
          configurable: true,
        });
      } else {
        (dynamicStyle as any)[propKey] = propVal;
      }
    });

    resolvedStyles[styleKey] = dynamicStyle;
  });

  return resolvedStyles;
};

// Dynamic theme object for direct JS usage (e.g. dynamic background colors, icon colors)
export const theme: ThemeColors = {} as ThemeColors;
Object.keys(darkPalette).forEach((key) => {
  Object.defineProperty(theme, key, {
    get() {
      const scheme = Appearance.getColorScheme();
      return scheme === 'light' ? lightPalette[key as keyof ThemeColors] : darkPalette[key as keyof ThemeColors];
    },
    enumerable: true,
    configurable: true,
  });
});

// Default font configuration
export const DefaultFontConfig = {
  regular: FontFamily.regular,
  medium: FontFamily.medium,
  bold: FontFamily.bold,
  semiBold: FontFamily.semiBold,
  extraBold: FontFamily.extraBold,
  black: FontFamily.black,
};
