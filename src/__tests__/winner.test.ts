import { describe, expect, it, jest, afterEach } from '@jest/globals';

import {
  calculateTargetRotation,
  selectControlledWinner,
  selectRandomWinner,
  selectWeightedWinner,
} from '../core/winner';
import { calculateSegmentAngles } from '../core/segments';
import type { WheelItem } from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const item = (id: string, opts: Partial<WheelItem> = {}): WheelItem => ({
  id,
  label: id,
  ...opts,
});

const POINTER_ANGLE = 270;

/**
 * Given a targetRotation returned by calculateTargetRotation, verify that
 * the winning segment's midAngle lands at the pointer position.
 */
function assertLandsAtPointer(midAngle: number, targetRotation: number) {
  const screen = (((midAngle + targetRotation) % 360) + 360) % 360;
  expect(screen).toBeCloseTo(POINTER_ANGLE);
}

// ─── selectRandomWinner ───────────────────────────────────────────────────────

describe('selectRandomWinner', () => {
  const items = [item('a'), item('b'), item('c')];

  it('returns one of the provided items', () => {
    const ids = new Set(items.map((i) => i.id));
    for (let i = 0; i < 50; i++) {
      const winner = selectRandomWinner(items);
      expect(ids.has(winner.id)).toBe(true);
    }
  });

  it('never selects a disabled item', () => {
    const mixed = [
      item('a', { disabled: true }),
      item('b'),
      item('c', { disabled: true }),
    ];
    for (let i = 0; i < 100; i++) {
      const winner = selectRandomWinner(mixed);
      expect(winner.id).toBe('b');
    }
  });

  it('throws when all items are disabled', () => {
    expect(() => selectRandomWinner([item('x', { disabled: true })])).toThrow();
  });

  it('throws on empty array', () => {
    expect(() => selectRandomWinner([])).toThrow();
  });

  it('uniform distribution: 2 items each appear ~50% over 2000 spins', () => {
    const counts: Record<string, number> = { a: 0, b: 0 };
    for (let i = 0; i < 2000; i++) {
      const winner = selectRandomWinner([item('a'), item('b')]);
      counts[winner.id] = (counts[winner.id] ?? 0) + 1;
    }
    // Each should appear between 40% and 60% of the time
    expect((counts.a ?? 0) / 2000).toBeGreaterThan(0.4);
    expect((counts.a ?? 0) / 2000).toBeLessThan(0.6);
  });

  it('hits the defensive "index out of range" guard when Math.random returns 1.0', () => {
    // Math.random should never return 1.0 in practice, but the guard exists
    // to satisfy noUncheckedIndexedAccess. Force it via spy.
    jest.spyOn(Math, 'random').mockReturnValueOnce(1.0 as number);
    // With length=1, Math.floor(1.0*1)=1, eligible[1]=undefined → throws
    expect(() => selectRandomWinner([item('solo')])).toThrow(
      'index out of range'
    );
  });
});

// ─── selectWeightedWinner ─────────────────────────────────────────────────────

describe('selectWeightedWinner', () => {
  it('returns one of the provided items', () => {
    const ids = new Set(['a', 'b', 'c']);
    const items = [
      item('a', { weight: 1 }),
      item('b', { weight: 2 }),
      item('c', { weight: 3 }),
    ];
    for (let i = 0; i < 50; i++) {
      expect(ids.has(selectWeightedWinner(items).id)).toBe(true);
    }
  });

  it('never selects a disabled item', () => {
    const items = [
      item('a', { weight: 99, disabled: true }),
      item('b', { weight: 1 }),
    ];
    for (let i = 0; i < 100; i++) {
      expect(selectWeightedWinner(items).id).toBe('b');
    }
  });

  it('throws when all items are disabled', () => {
    expect(() =>
      selectWeightedWinner([item('x', { disabled: true })])
    ).toThrow();
  });

  it('throws on empty array', () => {
    expect(() => selectWeightedWinner([])).toThrow();
  });

  it('distribution matches weights [1, 2, 3] within +-5% over 10000 spins', () => {
    const items = [
      item('a', { weight: 1 }),
      item('b', { weight: 2 }),
      item('c', { weight: 3 }),
    ];
    const counts: Record<string, number> = { a: 0, b: 0, c: 0 };
    const SPINS = 10_000;

    for (let i = 0; i < SPINS; i++) {
      const winner = selectWeightedWinner(items);
      counts[winner.id] = (counts[winner.id] ?? 0) + 1;
    }

    // Expected: a=1/6≈0.167, b=2/6≈0.333, c=3/6≈0.500
    const freqA = (counts.a ?? 0) / SPINS;
    const freqB = (counts.b ?? 0) / SPINS;
    const freqC = (counts.c ?? 0) / SPINS;

    expect(freqA).toBeGreaterThan(1 / 6 - 0.05);
    expect(freqA).toBeLessThan(1 / 6 + 0.05);
    expect(freqB).toBeGreaterThan(2 / 6 - 0.05);
    expect(freqB).toBeLessThan(2 / 6 + 0.05);
    expect(freqC).toBeGreaterThan(3 / 6 - 0.05);
    expect(freqC).toBeLessThan(3 / 6 + 0.05);
  });

  it('hits the floating-point fallback when rand equals totalWeight', () => {
    // Math.random returns 1.0 → rand=1.0*totalWeight → loop never satisfies rand<cumulative
    // → falls through to the last-item return path (lines 47-51)
    jest.spyOn(Math, 'random').mockReturnValueOnce(1.0 as number);
    const items = [item('a', { weight: 1 }), item('b', { weight: 1 })];
    // rand = 2.0, cumulative maxes at 2.0, condition 2.0 < 2.0 is false → returns last
    const winner = selectWeightedWinner(items);
    expect(winner.id).toBe('b');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('treats missing weight as 1 (equal to explicitly set weight=1)', () => {
    // Two items — one with explicit weight=1, one without — should split evenly
    const items = [item('explicit', { weight: 1 }), item('implicit')];
    const counts: Record<string, number> = { explicit: 0, implicit: 0 };
    for (let i = 0; i < 2000; i++) {
      const w = selectWeightedWinner(items);
      counts[w.id] = (counts[w.id] ?? 0) + 1;
    }
    const freqExplicit = (counts.explicit ?? 0) / 2000;
    expect(freqExplicit).toBeGreaterThan(0.4);
    expect(freqExplicit).toBeLessThan(0.6);
  });
});

// ─── selectControlledWinner ───────────────────────────────────────────────────

describe('selectControlledWinner', () => {
  const items = [
    item('gold'),
    item('silver'),
    item('bronze', { disabled: true }),
  ];

  it('returns the exact item matching the given id', () => {
    expect(selectControlledWinner(items, 'gold').id).toBe('gold');
    expect(selectControlledWinner(items, 'silver').id).toBe('silver');
  });

  it('throws on unknown id', () => {
    expect(() => selectControlledWinner(items, 'platinum')).toThrow(
      /not found/
    );
  });

  it('throws when target item is disabled', () => {
    expect(() => selectControlledWinner(items, 'bronze')).toThrow(/disabled/);
  });

  it('throws on empty items array', () => {
    expect(() => selectControlledWinner([], 'any')).toThrow();
  });
});

// ─── calculateTargetRotation ──────────────────────────────────────────────────

describe('calculateTargetRotation', () => {
  const items = [item('a'), item('b'), item('c'), item('d')];
  const angles = calculateSegmentAngles(items);

  it('landing position is exactly at the pointer (270 deg) for all segments', () => {
    for (const angle of angles) {
      const target = calculateTargetRotation(0, angle);
      assertLandsAtPointer(angle.midAngle, target);
    }
  });

  it('works correctly regardless of currentRotation value', () => {
    const testRotations = [0, 45, 180, 360, 900, 1800, 2025, -90];
    for (const angle of angles) {
      for (const current of testRotations) {
        const target = calculateTargetRotation(current, angle);
        assertLandsAtPointer(angle.midAngle, target);
      }
    }
  });

  it('total change in rotation is at least minSpins * 360', () => {
    const MIN_SPINS = 5;
    for (const angle of angles) {
      const target = calculateTargetRotation(0, angle, MIN_SPINS);
      expect(target - 0).toBeGreaterThanOrEqual(MIN_SPINS * 360);
    }
  });

  it('respects a custom minSpins', () => {
    const angle = angles[0];
    expect(angle).toBeDefined();

    const target3 = calculateTargetRotation(0, angle!, 3);

    const target8 = calculateTargetRotation(0, angle!, 8);
    expect(target3).toBeGreaterThanOrEqual(3 * 360);
    expect(target8).toBeGreaterThanOrEqual(8 * 360);

    assertLandsAtPointer(angle!.midAngle, target3);

    assertLandsAtPointer(angle!.midAngle, target8);
  });

  it('when already aligned (offset=0) adds at least one extra full rotation', () => {
    // Spin to a segment, then spin to the same segment again
    const angle = angles[0];
    expect(angle).toBeDefined();

    const firstTarget = calculateTargetRotation(0, angle!, 5);

    const secondTarget = calculateTargetRotation(firstTarget, angle!, 5);
    expect(secondTarget - firstTarget).toBeGreaterThanOrEqual(360);

    assertLandsAtPointer(angle!.midAngle, secondTarget);
  });

  it('controlled winner accuracy: spin to each segment 3 times in a row', () => {
    // Simulate 3 consecutive controlled spins to the same target
    let current = 0;
    const angle = angles[0];
    expect(angle).toBeDefined();
    for (let i = 0; i < 3; i++) {
      current = calculateTargetRotation(current, angle!, 5);

      assertLandsAtPointer(angle!.midAngle, current);
    }
  });
});
