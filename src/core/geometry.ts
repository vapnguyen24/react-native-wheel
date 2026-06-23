import type { ImagePosition, LabelPosition } from '../types';
import { degreesToRadians } from '../utils/math';

/**
 * Convert polar coordinates to Cartesian (SVG coordinate system).
 * 0° = 3 o'clock, angles increase clockwise.
 */
export function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
): { x: number; y: number } {
  const rad = degreesToRadians(angleDeg);
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

/**
 * Build an SVG path `d` string for a filled pie sector.
 *
 * SVG arcs cannot represent a full 360° in a single command — a degenerate
 * arc (same start and end point) draws nothing. When arcSpan >= 360 we split
 * into two 180° arcs instead.
 */
export function createSectorPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const arcSpan = endAngle - startAngle;

  if (arcSpan >= 360) {
    const p1 = polarToCartesian(cx, cy, r, startAngle);
    const p2 = polarToCartesian(cx, cy, r, startAngle + 180);
    return (
      `M ${p1.x} ${p1.y} ` +
      `A ${r} ${r} 0 1 1 ${p2.x} ${p2.y} ` +
      `A ${r} ${r} 0 1 1 ${p1.x} ${p1.y} Z`
    );
  }

  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArcFlag = arcSpan > 180 ? 1 : 0;

  return (
    `M ${cx} ${cy} ` +
    `L ${start.x} ${start.y} ` +
    `A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`
  );
}

/**
 * Compute where to place a text label inside a sector.
 * Label is placed at the midAngle, `radiusRatio` of the way out from centre.
 * `rotation` is in degrees — rotate text so it faces outward.
 */
export function calculateLabelPosition(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
  radiusRatio: number = 0.65
): LabelPosition {
  const midAngle = (startAngle + endAngle) / 2;
  const pos = polarToCartesian(cx, cy, r * radiusRatio, midAngle);
  return { x: pos.x, y: pos.y, rotation: midAngle };
}

/**
 * Compute where to render an image icon inside a sector.
 * Placed at 45% of the radius on the midAngle axis.
 * Size is 18% of the radius (square).
 */
export function calculateImagePosition(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): ImagePosition {
  const midAngle = (startAngle + endAngle) / 2;
  const size = r * 0.18;
  const pos = polarToCartesian(cx, cy, r * 0.45, midAngle);
  return { x: pos.x, y: pos.y, width: size, height: size };
}
