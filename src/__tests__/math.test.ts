import { describe, expect, it } from '@jest/globals';

import {
  clamp,
  degreesToRadians,
  lerp,
  normalizeAngle,
  radiansToDegrees,
} from '../utils/math';

// ─── clamp ────────────────────────────────────────────────────────────────────

describe('clamp', () => {
  it('returns min when value is below range', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('returns max when value is above range', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('returns value when in range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('returns min when value equals min', () => {
    expect(clamp(0, 0, 10)).toBe(0);
  });

  it('returns max when value equals max', () => {
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it('works with negative range', () => {
    expect(clamp(0, -10, -1)).toBe(-1);
    expect(clamp(-15, -10, -1)).toBe(-10);
  });

  it('works with decimal values', () => {
    expect(clamp(0.5, 0, 1)).toBeCloseTo(0.5);
    expect(clamp(-0.5, 0, 1)).toBeCloseTo(0);
  });
});

// ─── normalizeAngle ───────────────────────────────────────────────────────────

describe('normalizeAngle', () => {
  it('0 → 0', () => expect(normalizeAngle(0)).toBeCloseTo(0));
  it('360 → 0', () => expect(normalizeAngle(360)).toBeCloseTo(0));
  it('720 → 0', () => expect(normalizeAngle(720)).toBeCloseTo(0));
  it('-90 → 270', () => expect(normalizeAngle(-90)).toBeCloseTo(270));
  it('450 → 90', () => expect(normalizeAngle(450)).toBeCloseTo(90));
  it('180 stays 180', () => expect(normalizeAngle(180)).toBeCloseTo(180));
  it('-360 → 0', () => expect(normalizeAngle(-360)).toBeCloseTo(0));
  it('-1 → 359', () => expect(normalizeAngle(-1)).toBeCloseTo(359));

  it('result is always in [0, 360) for a range of inputs', () => {
    for (const deg of [-720, -360, -270, -90, 0, 90, 180, 270, 359, 360, 720]) {
      const result = normalizeAngle(deg);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(360);
    }
  });
});

// ─── degreesToRadians ─────────────────────────────────────────────────────────

describe('degreesToRadians', () => {
  it('0° → 0', () => expect(degreesToRadians(0)).toBeCloseTo(0));
  it('90° → π/2', () => expect(degreesToRadians(90)).toBeCloseTo(Math.PI / 2));
  it('180° → π', () => expect(degreesToRadians(180)).toBeCloseTo(Math.PI));
  it('270° → 3π/2', () =>
    expect(degreesToRadians(270)).toBeCloseTo((3 * Math.PI) / 2));
  it('360° → 2π', () => expect(degreesToRadians(360)).toBeCloseTo(2 * Math.PI));
  it('-90° → -π/2', () =>
    expect(degreesToRadians(-90)).toBeCloseTo(-Math.PI / 2));
  it('45° → π/4', () => expect(degreesToRadians(45)).toBeCloseTo(Math.PI / 4));
});

// ─── radiansToDegrees ─────────────────────────────────────────────────────────

describe('radiansToDegrees', () => {
  it('0 → 0°', () => expect(radiansToDegrees(0)).toBeCloseTo(0));
  it('π/2 → 90°', () => expect(radiansToDegrees(Math.PI / 2)).toBeCloseTo(90));
  it('π → 180°', () => expect(radiansToDegrees(Math.PI)).toBeCloseTo(180));
  it('3π/2 → 270°', () =>
    expect(radiansToDegrees((3 * Math.PI) / 2)).toBeCloseTo(270));
  it('2π → 360°', () => expect(radiansToDegrees(2 * Math.PI)).toBeCloseTo(360));
  it('-π/2 → -90°', () =>
    expect(radiansToDegrees(-Math.PI / 2)).toBeCloseTo(-90));

  it('is the inverse of degreesToRadians for common angles', () => {
    for (const deg of [0, 30, 45, 90, 135, 180, 270, 360]) {
      expect(radiansToDegrees(degreesToRadians(deg))).toBeCloseTo(deg);
    }
  });
});

// ─── lerp ─────────────────────────────────────────────────────────────────────

describe('lerp', () => {
  it('t=0 → a', () => expect(lerp(10, 90, 0)).toBeCloseTo(10));
  it('t=1 → b', () => expect(lerp(10, 90, 1)).toBeCloseTo(90));
  it('t=0.5 → midpoint', () => expect(lerp(0, 100, 0.5)).toBeCloseTo(50));
  it('t=0.25 → quarter', () => expect(lerp(0, 100, 0.25)).toBeCloseTo(25));
  it('works with negative values', () =>
    expect(lerp(-10, 10, 0.5)).toBeCloseTo(0));
  it('works when a === b', () => expect(lerp(7, 7, 0.5)).toBeCloseTo(7));
  it('handles t outside [0,1] for extrapolation', () => {
    expect(lerp(0, 100, 2)).toBeCloseTo(200);
    expect(lerp(0, 100, -1)).toBeCloseTo(-100);
  });
});
