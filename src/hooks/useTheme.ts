/**
 * useTheme — SafeDrive theme hook
 *
 * SafeDrive is a dark-only app, so this always returns the dark theme.
 */
import { Colors, ThemeColors } from '@/theme/colors';

export interface ThemeResult {
  colors: ThemeColors;
  isDark: boolean;
}

export function useTheme(): ThemeResult {
  return {
    colors: Colors.dark,
    isDark: true,
  };
}
