import { describe, expect, it } from '@jest/globals';

import { darkTheme, lightTheme, resolveTheme } from '../themes';
import type { ThemeConfig } from '../types';

// ─── lightTheme ───────────────────────────────────────────────────────────────

describe('lightTheme', () => {
  it('has a light background', () => {
    expect(lightTheme.background).toBe('#FFFFFF');
  });

  it('has a dark text colour', () => {
    expect(lightTheme.text).toBe('#000000');
  });

  it('has a non-empty palette', () => {
    expect(lightTheme.palette.length).toBeGreaterThan(0);
  });

  it('has border and pointer colours defined', () => {
    expect(lightTheme.border).toBeTruthy();
    expect(lightTheme.pointer).toBeTruthy();
  });
});

// ─── darkTheme ────────────────────────────────────────────────────────────────

describe('darkTheme', () => {
  it('has a dark background', () => {
    expect(darkTheme.background).toBe('#1A1A1A');
  });

  it('has a light text colour', () => {
    expect(darkTheme.text).toBe('#FFFFFF');
  });

  it('has a non-empty palette', () => {
    expect(darkTheme.palette.length).toBeGreaterThan(0);
  });

  it('background differs from lightTheme', () => {
    expect(darkTheme.background).not.toBe(lightTheme.background);
  });

  it('pointer colour differs from lightTheme', () => {
    expect(darkTheme.pointer).not.toBe(lightTheme.pointer);
  });
});

// ─── resolveTheme ─────────────────────────────────────────────────────────────

describe('resolveTheme', () => {
  it('"light" returns the exported lightTheme constant', () => {
    expect(resolveTheme('light')).toBe(lightTheme);
  });

  it('"dark" returns the exported darkTheme constant', () => {
    expect(resolveTheme('dark')).toBe(darkTheme);
  });

  it('a custom ThemeConfig is returned unchanged (same reference)', () => {
    const custom: ThemeConfig = {
      palette: ['#ff0000', '#00ff00'],
      background: '#111111',
      text: '#eeeeee',
      border: '#555555',
      pointer: '#ff4400',
    };
    expect(resolveTheme(custom)).toBe(custom);
  });

  it('a custom theme is not mixed with lightTheme properties', () => {
    const custom: ThemeConfig = {
      palette: ['#abcdef'],
      background: '#custom',
      text: '#custom',
      border: '#custom',
      pointer: '#custom',
    };
    const result = resolveTheme(custom);
    expect(result.background).toBe('#custom');
    expect(result.background).not.toBe(lightTheme.background);
  });
});
