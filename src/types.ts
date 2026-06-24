import type { ReactNode } from 'react';

// ─── Renderer & State ────────────────────────────────────────────────────────

export type RendererType = 'svg' | 'skia';

export type WheelState = 'idle' | 'spinning' | 'decelerating' | 'stopped';

// ─── Data ────────────────────────────────────────────────────────────────────

export interface WheelItem {
  id: string;
  label: string;
  color?: string;
  /** Relative weight for weighted mode. Defaults to 1. */
  weight?: number;
  imageUrl?: string;
  disabled?: boolean;
  metadata?: Record<string, unknown>;
}

// ─── Theme ───────────────────────────────────────────────────────────────────

export interface ThemeConfig {
  /** Ordered list of fallback segment colors (min 8 recommended). */
  palette: string[];
  background: string;
  text: string;
  border: string;
  pointer: string;
}

// ─── Geometry ─────────────────────────────────────────────────────────────────

export interface LabelPosition {
  x: number;
  y: number;
  /** Degrees — text faces outward from center. */
  rotation: number;
}

export interface ImagePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Pure angle data for a single segment (no rendering concerns). */
export interface SegmentAngle {
  id: string;
  startAngle: number;
  endAngle: number;
  midAngle: number;
}

/** Full computed layout for a segment — passed to renderers. */
export interface SegmentLayout extends SegmentAngle {
  /** SVG path `d` string for the sector shape. */
  path: string;
  labelPosition: LabelPosition;
  imagePosition: ImagePosition;
  color: string;
  item: WheelItem;
}

// ─── Ref API ─────────────────────────────────────────────────────────────────

export interface WheelRef {
  /** Trigger a random (or weighted) spin. No-op while already spinning. */
  spin(): void;
  /** Spin and stop exactly on the segment with the given id. */
  spinTo(id: string): void;
  /** Snap rotation back to 0 and reset to idle. */
  reset(): void;
  /** Immediately halt any in-progress spin. */
  stop(): void;
  /** Replace the segment data without unmounting the component. */
  replaceData(data: WheelItem[]): void;
  /** Return the current rotation in degrees. */
  getCurrentRotation(): number;
}

// ─── Component Props ─────────────────────────────────────────────────────────

export interface WheelProps {
  data: WheelItem[];

  // Renderer
  renderer?: RendererType;

  // Layout
  size?: number;

  // Spin behaviour
  duration?: number;
  weighted?: boolean;
  controlledWinnerId?: string;
  removeWinnerOnSelect?: boolean;

  // Callbacks
  onSpinStart?: () => void;
  onSpinEnd?: (winner: WheelItem) => void;
  /** Fires each time the pointer crosses into a new segment while spinning. */
  onTick?: (item: WheelItem) => void;
  /** Fires each time the pointer crosses a segment boundary (both directions). */
  onPointerCross?: (item: WheelItem) => void;

  // Custom render slots
  renderPointer?: () => ReactNode;
  renderCenter?: () => ReactNode;
  renderLabel?: (item: WheelItem, index: number) => ReactNode;
  renderSlice?: (item: WheelItem, index: number) => ReactNode;

  // Theme
  theme?: 'light' | 'dark' | ThemeConfig;

  // Interaction
  /** When true, touch/drag gestures are ignored. Programmatic spin() still works. */
  disabled?: boolean;

  // Accessibility
  accessibilityLabel?: string;
}
