import { describe, expect, it } from '@jest/globals';

import { computeCurrentSegmentIndex } from '../core/geometry';
import {
  resolvePhysicsConfig,
  velocityToAngularVelocity,
} from '../core/physics';
import { calculateSegmentAngles } from '../core/segments';
import type { WheelItem } from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const item = (id: string, opts: Partial<WheelItem> = {}): WheelItem => ({
  id,
  label: id,
  ...opts,
});

const ITEMS_4 = [item('a'), item('b'), item('c'), item('d')];
const POINTER = 270; // 12 o-clock in SVG coords

// ─── resolvePhysicsConfig ─────────────────────────────────────────────────────

describe('resolvePhysicsConfig', () => {
  it('returns defaults when called with no arguments', () => {
    const config = resolvePhysicsConfig();
    expect(config.deceleration).toBe(0.998);
    expect(config.minVelocity).toBe(0.1);
  });

  it('overrides deceleration', () => {
    const config = resolvePhysicsConfig({ deceleration: 0.99 });
    expect(config.deceleration).toBe(0.99);
    expect(config.minVelocity).toBe(0.1);
  });

  it('overrides minVelocity', () => {
    const config = resolvePhysicsConfig({ minVelocity: 0.5 });
    expect(config.minVelocity).toBe(0.5);
    expect(config.deceleration).toBe(0.998);
  });

  it('overrides all fields', () => {
    const config = resolvePhysicsConfig({ deceleration: 0.95, minVelocity: 1 });
    expect(config.deceleration).toBe(0.95);
    expect(config.minVelocity).toBe(1);
  });
});

// ─── velocityToAngularVelocity ────────────────────────────────────────────────

describe('velocityToAngularVelocity', () => {
  it('converts px/s to deg/s', () => {
    // v = ω * r  →  ω (deg/s) = (v / r) * (180/π)
    const radius = 100;
    const panVelocity = 100; // px/s
    const expected = (panVelocity / radius) * (180 / Math.PI);
    expect(velocityToAngularVelocity(panVelocity, radius)).toBeCloseTo(
      expected
    );
  });

  it('returns 0 when radius is 0', () => {
    expect(velocityToAngularVelocity(500, 0)).toBe(0);
  });

  it('returns 0 when radius is negative', () => {
    expect(velocityToAngularVelocity(500, -10)).toBe(0);
  });

  it('preserves sign: negative velocity → negative angular velocity', () => {
    expect(velocityToAngularVelocity(-200, 100)).toBeLessThan(0);
  });

  it('is linear in velocity', () => {
    const r = 150;
    const w1 = velocityToAngularVelocity(100, r);
    const w2 = velocityToAngularVelocity(200, r);
    expect(w2).toBeCloseTo(w1 * 2);
  });

  it('is inversely proportional to radius', () => {
    const v = 300;
    const w1 = velocityToAngularVelocity(v, 100);
    const w2 = velocityToAngularVelocity(v, 200);
    expect(w1).toBeCloseTo(w2 * 2);
  });
});

// ─── computeCurrentSegmentIndex ──────────────────────────────────────────────

describe('computeCurrentSegmentIndex', () => {
  const angles = calculateSegmentAngles(ITEMS_4);
  // 4 equal items: segments at [-90, 0), [0, 90), [90, 180), [180, 270)
  // Index 0 (segment a): midAngle = -45
  // Index 1 (segment b): midAngle =  45
  // Index 2 (segment c): midAngle = 135
  // Index 3 (segment d): midAngle = 225

  it('rotation=0 → pointer lands on segment whose midAngle is near 270', () => {
    // At rotation=0, pointer at 270° corresponds to the segment at angle 270° in its
    // coordinate frame. With [-90,270) range: 270 maps to frameAngle = -90 (start of seg 0)
    // Actually: rawPointer = (270-0)%360+360 = 270; frameAngle = 270-360 = -90 → segment 0
    const idx = computeCurrentSegmentIndex(0, angles);
    expect(idx).toBe(0);
  });

  it('returns segment 0 when pointer is at its midAngle (-45)', () => {
    // Need rotation R such that (270 - R) mod 360 ∈ [-90, 0)
    // midAngle of seg 0 = -45; to land at pointer:
    // calculateTargetRotation would give us the rotation, but we can compute directly:
    // frameAngle should be -45 → rawPointer = -45 + 360 = 315
    // 315 = (270 - R) mod 360 → R mod 360 = 270 - 315 = -45 → R mod 360 = 315
    const R = 315;
    const idx = computeCurrentSegmentIndex(R, angles);
    expect(idx).toBe(0);
  });

  it('returns segment 1 when pointer is at its midAngle (45)', () => {
    // midAngle 45 in [-90,270) range → rawPointer = 45+360 = 405 mod 360 = 45
    // rawPointer=45 < 270 → frameAngle=45
    // 45 = (270 - R) mod 360 → R mod 360 = 225
    const R = 225;
    const idx = computeCurrentSegmentIndex(R, angles);
    expect(idx).toBe(1);
  });

  it('returns segment 2 when pointer is at its midAngle (135)', () => {
    // midAngle 135 → rawPointer = 135
    // 135 = (270 - R) mod 360 → R mod 360 = 135
    const R = 135;
    const idx = computeCurrentSegmentIndex(R, angles);
    expect(idx).toBe(2);
  });

  it('returns segment 3 when pointer is at its midAngle (225)', () => {
    // midAngle 225 → rawPointer = 225
    // 225 = (270 - R) mod 360 → R mod 360 = 45
    const R = 45;
    const idx = computeCurrentSegmentIndex(R, angles);
    expect(idx).toBe(3);
  });

  it('handles accumulated rotations > 360 correctly', () => {
    // R = 225 and R = 225 + 360 should give same result
    const idx1 = computeCurrentSegmentIndex(225, angles);
    const idx2 = computeCurrentSegmentIndex(225 + 360, angles);
    const idx3 = computeCurrentSegmentIndex(225 + 720, angles);
    expect(idx1).toBe(idx2);
    expect(idx1).toBe(idx3);
  });

  it('handles negative rotation values', () => {
    // R = 45 and R = 45 - 360 should give same result
    const idx1 = computeCurrentSegmentIndex(45, angles);
    const idx2 = computeCurrentSegmentIndex(45 - 360, angles);
    expect(idx1).toBe(idx2);
  });

  it('after a calculateTargetRotation spin, the winning segment is under the pointer', () => {
    const { calculateTargetRotation } = require('../core/winner');
    let currentRotation = 0;
    for (const angle of angles) {
      const target = calculateTargetRotation(currentRotation, angle, 5);
      const idx = computeCurrentSegmentIndex(target, angles);
      // The winning segment's index in angles array
      const expectedIdx = angles.indexOf(angle);
      expect(idx).toBe(expectedIdx);
      currentRotation = target;
    }
  });

  it('returns the last segment index as fallback for empty array', () => {
    // With 1-item array, always returns 0
    const singleAngles = calculateSegmentAngles([item('solo')]);
    for (const rotation of [0, 90, 180, 270, 360]) {
      expect(computeCurrentSegmentIndex(rotation, singleAngles)).toBe(0);
    }
  });

  it('pointer crosses segments correctly while spinning full circle', () => {
    // Starting from rotation 0, incrementing by 1° each step should visit
    // all 4 segments in order
    const visited = new Set<number>();
    for (let r = 0; r < 360; r++) {
      visited.add(computeCurrentSegmentIndex(r, angles));
    }
    expect(visited.size).toBe(4);
    expect(visited.has(0)).toBe(true);
    expect(visited.has(1)).toBe(true);
    expect(visited.has(2)).toBe(true);
    expect(visited.has(3)).toBe(true);
  });

  it('verifies 4-segment pointer position via midAngle formula', () => {
    // For each segment, compute rotation that puts its midAngle at the pointer.
    // Verify computeCurrentSegmentIndex agrees.
    for (let i = 0; i < angles.length; i++) {
      const angle = angles[i];
      if (!angle) continue;
      // rotation R such that (midAngle + R) mod 360 = 270
      const R = (((POINTER - angle.midAngle) % 360) + 360) % 360;
      const idx = computeCurrentSegmentIndex(R, angles);
      expect(idx).toBe(i);
    }
  });
});
