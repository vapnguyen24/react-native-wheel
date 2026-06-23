import type { SegmentAngle, SegmentLayout, WheelItem } from '../types';
import {
  calculateImagePosition,
  calculateLabelPosition,
  createSectorPath,
} from './geometry';

/** The first segment starts at 12 o'clock in SVG coordinates (y-axis down). */
const START_ANGLE = -90;

/** Built-in colour palette — 8 visually distinct, colourblind-friendly hues. */
export const DEFAULT_PALETTE: readonly string[] = [
  '#E8413E',
  '#F4A228',
  '#F7D13E',
  '#4BB543',
  '#3E7BFA',
  '#7C4DFF',
  '#FF4081',
  '#00BCD4',
];

/**
 * Calculate the start/end/mid angles for every segment.
 *
 * When no item carries a `weight`, all items get equal arcs (weight defaults
 * to 1). When any item has a weight, arcs are proportional to weights.
 * Disabled items are still allocated space — they just can't be selected as
 * winners.
 */
export function calculateSegmentAngles(items: WheelItem[]): SegmentAngle[] {
  const totalWeight = items.reduce((sum, item) => sum + (item.weight ?? 1), 0);
  let cursor = START_ANGLE;

  return items.map((item) => {
    const span = ((item.weight ?? 1) / totalWeight) * 360;
    const startAngle = cursor;
    const endAngle = cursor + span;
    const midAngle = (startAngle + endAngle) / 2;
    cursor = endAngle;
    return { id: item.id, startAngle, endAngle, midAngle };
  });
}

/**
 * Build the full computed layout for each segment.
 *
 * `palette` cycles for segments without an explicit `item.color`. Pass the
 * resolved theme palette from the hook layer; the built-in `DEFAULT_PALETTE`
 * is used when none is provided.
 */
export function buildSegmentLayouts(
  items: WheelItem[],
  angles: SegmentAngle[],
  cx: number,
  cy: number,
  r: number,
  palette: readonly string[] = DEFAULT_PALETTE
): SegmentLayout[] {
  const colors = palette.length > 0 ? palette : DEFAULT_PALETTE;

  return items.map((item, index) => {
    const angle = angles[index];
    if (angle === undefined) {
      throw new Error(
        `buildSegmentLayouts: missing angle for segment at index ${index}`
      );
    }
    const { startAngle, endAngle, midAngle } = angle;
    const color = item.color ?? colors[index % colors.length] ?? '#cccccc';

    return {
      id: item.id,
      startAngle,
      endAngle,
      midAngle,
      path: createSectorPath(cx, cy, r, startAngle, endAngle),
      labelPosition: calculateLabelPosition(cx, cy, r, startAngle, endAngle),
      imagePosition: calculateImagePosition(cx, cy, r, startAngle, endAngle),
      color,
      item,
    };
  });
}
