import type { ThemeConfig } from '../types';
import { DEFAULT_PALETTE } from '../core/segments';

export const lightTheme: ThemeConfig = {
  palette: [...DEFAULT_PALETTE],
  background: '#FFFFFF',
  text: '#000000',
  border: '#E0E0E0',
  pointer: '#E8413E',
};

export const darkTheme: ThemeConfig = {
  palette: [...DEFAULT_PALETTE],
  background: '#1A1A1A',
  text: '#FFFFFF',
  border: '#333333',
  pointer: '#FF6B68',
};

export function resolveTheme(
  theme: 'light' | 'dark' | ThemeConfig
): ThemeConfig {
  if (theme === 'light') return lightTheme;
  if (theme === 'dark') return darkTheme;
  return theme;
}
