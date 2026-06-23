import type { SegmentAngle, WheelItem } from '../types';

/** Pointer sits at 12 o-clock = 270 deg in SVG coordinate system. */
const POINTER_ANGLE = 270;

/** Uniform random selection from non-disabled items. */
export function selectRandomWinner(items: WheelItem[]): WheelItem {
  const eligible = items.filter((item) => !item.disabled);
  if (eligible.length === 0) {
    throw new Error(
      'selectRandomWinner: no eligible items (all disabled or array empty)'
    );
  }
  const index = Math.floor(Math.random() * eligible.length);
  const winner = eligible[index];
  if (winner === undefined) {
    throw new Error('selectRandomWinner: index out of range');
  }
  return winner;
}

/**
 * Weight-proportional random selection.
 * Items without a `weight` default to 1. Disabled items are excluded.
 */
export function selectWeightedWinner(items: WheelItem[]): WheelItem {
  const eligible = items.filter((item) => !item.disabled);
  if (eligible.length === 0) {
    throw new Error('selectWeightedWinner: no eligible items');
  }

  const totalWeight = eligible.reduce(
    (sum, item) => sum + (item.weight ?? 1),
    0
  );
  const rand = Math.random() * totalWeight;
  let cumulative = 0;

  for (const item of eligible) {
    cumulative += item.weight ?? 1;
    if (rand < cumulative) {
      return item;
    }
  }

  // Floating-point edge case: rand is exactly equal to totalWeight
  const last = eligible[eligible.length - 1];
  if (last === undefined) {
    throw new Error('selectWeightedWinner: empty eligible array');
  }
  return last;
}

/** Find item by id. Throws if not found or disabled. */
export function selectControlledWinner(
  items: WheelItem[],
  id: string
): WheelItem {
  const found = items.find((item) => item.id === id);
  if (found === undefined) {
    throw new Error(`selectControlledWinner: item with id "${id}" not found`);
  }
  if (found.disabled) {
    throw new Error(`selectControlledWinner: item with id "${id}" is disabled`);
  }
  return found;
}

/**
 * Calculate the target rotation (in degrees) that will stop the wheel with
 * the winning segment exactly under the pointer.
 *
 * The formula accounts for `currentRotation` so it is correct for any
 * accumulated rotation value, not just when the wheel starts at 0.
 *
 * Derivation:
 *   After total rotation R, a segment at midAngle θ appears at (θ + R) mod 360.
 *   We need (θ + R) mod 360 = POINTER_ANGLE (270).
 *   ∴ R mod 360 = (270 − θ + 360) mod 360   [requiredMod]
 *   Find smallest offset > 0 s.t. (currentRotation + offset) mod 360 = requiredMod,
 *   then add minSpins full rotations on top.
 */
export function calculateTargetRotation(
  currentRotation: number,
  winnerAngle: SegmentAngle,
  minSpins: number = 5
): number {
  const requiredMod =
    (((POINTER_ANGLE - winnerAngle.midAngle) % 360) + 360) % 360;
  const currentMod = ((currentRotation % 360) + 360) % 360;
  const rawOffset = (requiredMod - currentMod + 360) % 360;
  // rawOffset = 0 means already aligned; ensure at least one extra full rotation
  const offset = rawOffset === 0 ? 360 : rawOffset;
  return currentRotation + minSpins * 360 + offset;
}
