import { describe, expect, it } from '@jest/globals';

import {
  calculateImagePosition,
  calculateLabelPosition,
  createSectorPath,
  polarToCartesian,
} from '../core/geometry';
import {
  buildSegmentLayouts,
  calculateSegmentAngles,
  DEFAULT_PALETTE,
} from '../core/segments';
import type { WheelItem } from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const item = (id: string, opts: Partial<WheelItem> = {}): WheelItem => ({
  id,
  label: id,
  ...opts,
});

const arcCount = (path: string) => (path.match(/\bA\b/g) ?? []).length;

// ─── polarToCartesian ─────────────────────────────────────────────────────────

describe('polarToCartesian', () => {
  it('0 deg -> 3 o-clock (right)', () => {
    const p = polarToCartesian(100, 100, 50, 0);
    expect(p.x).toBeCloseTo(150);
    expect(p.y).toBeCloseTo(100);
  });

  it('90 deg -> 6 o-clock (bottom)', () => {
    const p = polarToCartesian(100, 100, 50, 90);
    expect(p.x).toBeCloseTo(100);
    expect(p.y).toBeCloseTo(150);
  });

  it('180 deg -> 9 o-clock (left)', () => {
    const p = polarToCartesian(100, 100, 50, 180);
    expect(p.x).toBeCloseTo(50);
    expect(p.y).toBeCloseTo(100);
  });

  it('270 deg -> 12 o-clock (top)', () => {
    const p = polarToCartesian(100, 100, 50, 270);
    expect(p.x).toBeCloseTo(100);
    expect(p.y).toBeCloseTo(50);
  });

  it('-90 deg is identical to 270 deg', () => {
    const a = polarToCartesian(100, 100, 50, -90);
    const b = polarToCartesian(100, 100, 50, 270);
    expect(a.x).toBeCloseTo(b.x);
    expect(a.y).toBeCloseTo(b.y);
  });

  it('r=0 always returns (cx, cy)', () => {
    const p = polarToCartesian(40, 80, 0, 37);
    expect(p.x).toBeCloseTo(40);
    expect(p.y).toBeCloseTo(80);
  });
});

// ─── createSectorPath ─────────────────────────────────────────────────────────

describe('createSectorPath', () => {
  it('contains an arc command', () => {
    expect(createSectorPath(100, 100, 50, -90, 0)).toContain('A');
  });

  it('starts from centre with M cx cy', () => {
    const path = createSectorPath(100, 100, 50, -90, 0);
    expect(path).toContain('M 100 100');
  });

  it('uses largeArcFlag=0 for arcs <= 180 deg', () => {
    // 90 deg arc
    const path = createSectorPath(100, 100, 50, 0, 90);
    expect(path).toContain('A 50 50 0 0 1');
  });

  it('uses largeArcFlag=1 for arcs > 180 deg', () => {
    // 270 deg arc
    const path = createSectorPath(100, 100, 50, 0, 270);
    expect(path).toContain('A 50 50 0 1 1');
  });

  it('exactly 180 deg uses largeArcFlag=0', () => {
    const path = createSectorPath(100, 100, 50, 0, 180);
    expect(path).toContain('A 50 50 0 0 1');
  });

  it('full 360 deg uses two arcs to avoid a degenerate single arc', () => {
    const path = createSectorPath(100, 100, 50, 0, 360);
    expect(arcCount(path)).toBe(2);
  });

  it('full circle path does not start from centre', () => {
    // Full circle renders as a pure circle — no "M cx cy L …" form
    const path = createSectorPath(100, 100, 50, 0, 360);
    expect(path).not.toContain('L');
  });

  it('closes the path with Z', () => {
    expect(createSectorPath(100, 100, 50, 0, 90)).toContain('Z');
  });
});

// ─── calculateLabelPosition ───────────────────────────────────────────────────

describe('calculateLabelPosition', () => {
  it('places label at midAngle on the radius', () => {
    // Sector 0->90 deg, midAngle=45, cx=cy=100, r=100, radiusRatio=0.65
    const result = calculateLabelPosition(100, 100, 100, 0, 90);
    const cos45 = Math.cos(Math.PI / 4);
    const sin45 = Math.sin(Math.PI / 4);
    expect(result.x).toBeCloseTo(100 + 65 * cos45);
    expect(result.y).toBeCloseTo(100 + 65 * sin45);
    expect(result.rotation).toBeCloseTo(45);
  });

  it('respects a custom radiusRatio', () => {
    // Sector 0->0 deg, midAngle=0, radiusRatio=0.5 -> point at (cx+r*0.5, cy)
    const result = calculateLabelPosition(100, 100, 100, 0, 0, 0.5);
    expect(result.x).toBeCloseTo(150);
    expect(result.y).toBeCloseTo(100);
    expect(result.rotation).toBeCloseTo(0);
  });

  it('midAngle equals (startAngle + endAngle) / 2 for right-half segments', () => {
    const start = 30;
    const end = 110;
    const result = calculateLabelPosition(0, 0, 100, start, end);
    // midAngle = 70°, which is < 90° so no flip
    expect(result.rotation).toBeCloseTo(70);
  });

  it('adds 180° for left-half segments so text is never upside-down', () => {
    // midAngle = (90 + 180) / 2 = 135° → in [90°, 270°) → rotation = 315°
    const result = calculateLabelPosition(0, 0, 100, 90, 180);
    expect(result.rotation).toBeCloseTo(315);
  });
});

// ─── calculateImagePosition ───────────────────────────────────────────────────

describe('calculateImagePosition', () => {
  it('returns a square bounding box (width === height)', () => {
    const pos = calculateImagePosition(100, 100, 100, 0, 90);
    expect(pos.width).toBeCloseTo(pos.height);
  });

  it('size is 18% of radius', () => {
    const pos = calculateImagePosition(100, 100, 100, 0, 90);
    expect(pos.width).toBeCloseTo(18);
  });

  it('centre is on the midAngle axis at 45% of radius', () => {
    // midAngle=0 deg, r=100 -> x = cx + 100*0.45*cos(0) = cx+45, y = cy
    const pos = calculateImagePosition(100, 100, 100, 0, 0);
    expect(pos.x).toBeCloseTo(145);
    expect(pos.y).toBeCloseTo(100);
  });
});

// ─── calculateSegmentAngles ───────────────────────────────────────────────────

describe('calculateSegmentAngles', () => {
  it('4 equal items each get 90 deg', () => {
    const items = [item('a'), item('b'), item('c'), item('d')];
    const angles = calculateSegmentAngles(items);
    expect(angles).toHaveLength(4);
    for (const angle of angles) {
      expect(angle.endAngle - angle.startAngle).toBeCloseTo(90);
    }
  });

  it('first segment starts at -90 deg (12 o-clock)', () => {
    const angles = calculateSegmentAngles([item('a'), item('b')]);
    expect(angles).toHaveLength(2);

    expect(angles[0]!.startAngle).toBeCloseTo(-90);
  });

  it('last segment ends at 270 deg (-90 + 360)', () => {
    const angles = calculateSegmentAngles([item('a'), item('b')]);
    expect(angles).toHaveLength(2);

    expect(angles[1]!.endAngle).toBeCloseTo(270);
  });

  it('total span is exactly 360 deg', () => {
    const angles = calculateSegmentAngles([item('a'), item('b'), item('c')]);
    expect(angles).toHaveLength(3);

    const first = angles[0]!;

    const last = angles[2]!;
    expect(last.endAngle - first.startAngle).toBeCloseTo(360);
  });

  it('midAngle is the bisector of each segment', () => {
    const angles = calculateSegmentAngles([item('a'), item('b'), item('c')]);
    for (const angle of angles) {
      expect(angle.midAngle).toBeCloseTo(
        (angle.startAngle + angle.endAngle) / 2
      );
    }
  });

  it('single item gets a full 360 deg arc', () => {
    const angles = calculateSegmentAngles([item('solo')]);
    expect(angles).toHaveLength(1);

    const only = angles[0]!;
    expect(only.endAngle - only.startAngle).toBeCloseTo(360);
  });

  it('weighted [1, 2, 3] -> proportional arcs 60, 120, 180 deg', () => {
    const items = [
      item('a', { weight: 1 }),
      item('b', { weight: 2 }),
      item('c', { weight: 3 }),
    ];
    const angles = calculateSegmentAngles(items);
    expect(angles).toHaveLength(3);
    const expectedSpans = [60, 120, 180];
    angles.forEach((angle, i) => {
      expect(angle.endAngle - angle.startAngle).toBeCloseTo(
        expectedSpans[i] ?? 0
      );
    });
  });

  it('disabled items still get allocated space', () => {
    const items = [item('a'), item('b', { disabled: true }), item('c')];
    const angles = calculateSegmentAngles(items);
    expect(angles).toHaveLength(3);
    for (const angle of angles) {
      expect(angle.endAngle - angle.startAngle).toBeCloseTo(120);
    }
  });

  it('segments are contiguous (each end equals next start)', () => {
    const items = [item('a'), item('b'), item('c'), item('d')];
    const angles = calculateSegmentAngles(items);
    for (let i = 0; i < angles.length - 1; i++) {
      expect(angles[i]!.endAngle).toBeCloseTo(angles[i + 1]!.startAngle);
    }
  });
});

// ─── buildSegmentLayouts ──────────────────────────────────────────────────────

describe('buildSegmentLayouts', () => {
  const items = [item('x'), item('y'), item('z')];
  const angles = calculateSegmentAngles(items);
  const layouts = buildSegmentLayouts(items, angles, 100, 100, 50);

  it('returns one layout per item', () => {
    expect(layouts).toHaveLength(3);
  });

  it('each layout path contains an arc', () => {
    for (const layout of layouts) {
      expect(layout.path).toContain('A');
    }
  });

  it('each layout has a non-empty color', () => {
    for (const layout of layouts) {
      expect(layout.color.length).toBeGreaterThan(0);
    }
  });

  it('respects item.color over the default palette', () => {
    const coloredItems = [item('red', { color: '#ff0000' })];
    const coloredAngles = calculateSegmentAngles(coloredItems);
    const [layout] = buildSegmentLayouts(
      coloredItems,
      coloredAngles,
      100,
      100,
      50
    );
    expect(layout).toBeDefined();

    expect(layout!.color).toBe('#ff0000');
  });

  it('cycles through palette for items without explicit color', () => {
    const manyItems = DEFAULT_PALETTE.map((_, i) => item(`s${i}`));
    const extraItems = [...manyItems, item('extra')];
    const extraAngles = calculateSegmentAngles(extraItems);
    const extraLayouts = buildSegmentLayouts(
      extraItems,
      extraAngles,
      100,
      100,
      50
    );
    expect(extraLayouts).toHaveLength(extraItems.length);
    // The 9th item (index 8) cycles back to palette[0]

    expect(extraLayouts[8]!.color).toBe(DEFAULT_PALETTE[0]);
  });

  it('carries the original WheelItem on each layout', () => {
    layouts.forEach((layout, i) => {
      expect(layout.item).toBe(items[i]!);
    });
  });

  it('throws when angles array is shorter than items array', () => {
    expect(() =>
      buildSegmentLayouts(items, angles.slice(0, 1), 100, 100, 50)
    ).toThrow();
  });
});
