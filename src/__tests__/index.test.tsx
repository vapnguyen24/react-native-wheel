import { describe, expect, it } from '@jest/globals';

import { Wheel, darkTheme, lightTheme, resolveTheme } from '../index';

describe('public API exports', () => {
  it('exports Wheel as a React component', () => {
    expect(Wheel).toBeDefined();
    // React.memo + forwardRef wraps the component
    expect(typeof Wheel).toBe('object');
    expect(Wheel).not.toBeNull();
  });

  it('exports lightTheme with required ThemeConfig fields', () => {
    expect(lightTheme).toBeDefined();
    expect(lightTheme.background).toBe('#FFFFFF');
    expect(lightTheme.palette.length).toBeGreaterThan(0);
  });

  it('exports darkTheme with required ThemeConfig fields', () => {
    expect(darkTheme).toBeDefined();
    expect(darkTheme.background).toBe('#1A1A1A');
    expect(darkTheme.palette.length).toBeGreaterThan(0);
  });

  it('exports resolveTheme as a function', () => {
    expect(typeof resolveTheme).toBe('function');
  });

  it('resolveTheme("light") returns lightTheme', () => {
    expect(resolveTheme('light')).toBe(lightTheme);
  });

  it('resolveTheme("dark") returns darkTheme', () => {
    expect(resolveTheme('dark')).toBe(darkTheme);
  });
});
