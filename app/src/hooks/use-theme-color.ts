import { useColorScheme } from 'nativewind';

import { themeColors, type ThemeColorName } from '@/constants/colors.gen';

/**
 * Resolves a semantic color token to its hex value for the current scheme.
 * Use for native props that can't take a `className` (icon `color`, native tab
 * bar colors, `ActivityIndicator`); prefer `className` everywhere else.
 */
export function useThemeColor(name: ThemeColorName): string {
  const { colorScheme } = useColorScheme();
  return themeColors[colorScheme === 'dark' ? 'dark' : 'light'][name];
}
