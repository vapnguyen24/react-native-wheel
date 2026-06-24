import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';

import { clearImageCache, getCachedImageUri } from '../utils/image';

// Reset cache between tests so they are independent
beforeEach(() => clearImageCache());
afterEach(() => clearImageCache());

describe('getCachedImageUri', () => {
  it('returns the exact uri that was passed in', () => {
    const uri = 'https://example.com/photo.jpg';
    expect(getCachedImageUri(uri)).toBe(uri);
  });

  it('returns the same string reference on repeated calls', () => {
    const uri = 'https://example.com/photo.jpg';
    const first = getCachedImageUri(uri);
    const second = getCachedImageUri(uri);
    expect(first).toBe(second);
  });

  it('stores and retrieves multiple distinct uris independently', () => {
    const a = 'https://a.com/1.png';
    const b = 'https://b.com/2.png';
    expect(getCachedImageUri(a)).toBe(a);
    expect(getCachedImageUri(b)).toBe(b);
  });

  it('handles empty-string uri without throwing', () => {
    expect(getCachedImageUri('')).toBe('');
  });
});

describe('clearImageCache', () => {
  it('can be called on an empty cache without throwing', () => {
    expect(() => clearImageCache()).not.toThrow();
  });

  it('does not affect getCachedImageUri after clearing', () => {
    const uri = 'https://example.com/photo.jpg';
    getCachedImageUri(uri);
    clearImageCache();
    // After clear the cache is empty but the function still works
    expect(getCachedImageUri(uri)).toBe(uri);
  });

  it('can be called multiple times in a row', () => {
    expect(() => {
      clearImageCache();
      clearImageCache();
    }).not.toThrow();
  });
});
