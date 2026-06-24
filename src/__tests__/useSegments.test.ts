import { renderHook } from '@testing-library/react-native';
import { describe, expect, it } from '@jest/globals';

import { useSegments } from '../hooks/useSegments';
import { DEFAULT_PALETTE } from '../core/segments';
import type { WheelItem } from '../types';

const item = (id: string, opts: Partial<WheelItem> = {}): WheelItem => ({
  id,
  label: id,
  ...opts,
});

describe('useSegments', () => {
  it('returns [] when items array is empty', async () => {
    const { result } = await renderHook(() => useSegments([], 160, 160, 160));
    expect(result.current).toEqual([]);
  });

  it('returns one SegmentLayout per item', async () => {
    const items = [item('a'), item('b'), item('c')];
    const { result } = await renderHook(() =>
      useSegments(items, 160, 160, 160)
    );
    expect(result.current).toHaveLength(3);
  });

  it('each layout has an SVG path string containing an arc command', async () => {
    const items = [item('x'), item('y')];
    const { result } = await renderHook(() =>
      useSegments(items, 100, 100, 100)
    );
    for (const layout of result.current) {
      expect(layout.path).toContain('A');
    }
  });

  it('each layout carries the original WheelItem reference', async () => {
    const items = [item('a'), item('b')];
    const { result } = await renderHook(() =>
      useSegments(items, 100, 100, 100)
    );
    result.current.forEach((layout, i) => {
      expect(layout.item).toBe(items[i]);
    });
  });

  it('uses a provided palette for colours', async () => {
    const items = [item('a'), item('b')];
    const palette = ['#aabbcc', '#ddeeff'];
    const { result } = await renderHook(() =>
      useSegments(items, 100, 100, 100, palette)
    );
    expect(result.current[0]?.color).toBe('#aabbcc');
    expect(result.current[1]?.color).toBe('#ddeeff');
  });

  it('respects item.color when set, overriding the palette', async () => {
    const items = [item('custom', { color: '#123456' })];
    const { result } = await renderHook(() =>
      useSegments(items, 100, 100, 100)
    );
    expect(result.current[0]?.color).toBe('#123456');
  });

  it('falls back to DEFAULT_PALETTE when no palette is provided', async () => {
    const items = [item('a')];
    const { result } = await renderHook(() =>
      useSegments(items, 100, 100, 100)
    );
    expect(result.current[0]?.color).toBe(DEFAULT_PALETTE[0]);
  });

  it('each layout has valid labelPosition coordinates', async () => {
    const items = [item('a'), item('b')];
    const { result } = await renderHook(() =>
      useSegments(items, 160, 160, 160)
    );
    for (const layout of result.current) {
      expect(typeof layout.labelPosition.x).toBe('number');
      expect(typeof layout.labelPosition.y).toBe('number');
      expect(typeof layout.labelPosition.rotation).toBe('number');
    }
  });

  it('handles a single item (full 360° sector)', async () => {
    const items = [item('solo')];
    const { result } = await renderHook(() =>
      useSegments(items, 100, 100, 100)
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0]?.path).toContain('A');
  });

  it('returns stable reference when inputs have not changed', async () => {
    const items = [item('a'), item('b')];
    const { result, rerender } = await renderHook(
      ({ its }: { its: WheelItem[] }) => useSegments(its, 100, 100, 100),
      { initialProps: { its: items } }
    );
    const first = result.current;
    await rerender({ its: items });
    expect(result.current).toBe(first);
  });

  it('recomputes when items reference changes', async () => {
    const items1 = [item('a')];
    const items2 = [item('b')];
    const { result, rerender } = await renderHook(
      ({ its }: { its: WheelItem[] }) => useSegments(its, 100, 100, 100),
      { initialProps: { its: items1 } }
    );
    const first = result.current;
    await rerender({ its: items2 });
    expect(result.current).not.toBe(first);
    expect(result.current[0]?.item.id).toBe('b');
  });
});
