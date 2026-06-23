import { useMemo } from 'react';

import { buildSegmentLayouts, calculateSegmentAngles } from '../core/segments';
import type { SegmentLayout, WheelItem } from '../types';

/**
 * Memoised segment layout computation.
 * Re-runs only when `items`, `cx`, `cy`, or `r` change.
 */
export function useSegments(
  items: WheelItem[],
  cx: number,
  cy: number,
  r: number
): SegmentLayout[] {
  return useMemo(() => {
    if (items.length === 0) return [];
    const angles = calculateSegmentAngles(items);
    return buildSegmentLayouts(items, angles, cx, cy, r);
  }, [items, cx, cy, r]);
}
