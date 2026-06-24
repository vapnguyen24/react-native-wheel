import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ForwardedRef,
} from 'react';
import type { SharedValue } from 'react-native-reanimated';
import type { PanGesture } from 'react-native-gesture-handler';

import {
  calculateTargetRotation,
  selectControlledWinner,
  selectRandomWinner,
  selectWeightedWinner,
} from '../core/winner';
import type { PhysicsConfig } from '../core/physics';
import type {
  SegmentLayout,
  ThemeConfig,
  WheelItem,
  WheelRef,
  WheelState,
} from '../types';
import { resolveTheme } from '../themes';
import { useSegments } from './useSegments';
import { useWheelAnimation } from './useWheelAnimation';
import { useWheelGesture } from './useWheelGesture';
import { useWheelState } from './useWheelState';

const DEFAULT_SIZE = 320;
const DEFAULT_DURATION = 5000;
const MIN_FLICK_DEG_PER_SEC = 30;

export interface UseWheelOptions {
  data: WheelItem[];
  size?: number;
  weighted?: boolean;
  controlledWinnerId?: string;
  duration?: number;
  removeWinnerOnSelect?: boolean;
  disabled?: boolean;
  theme?: 'light' | 'dark' | ThemeConfig;
  onSpinStart?: () => void;
  onSpinEnd?: (winner: WheelItem) => void;
  onTick?: (item: WheelItem) => void;
  onPointerCross?: (item: WheelItem) => void;
  physics?: PhysicsConfig;
  ref?: ForwardedRef<WheelRef>;
}

export interface UseWheelResult {
  rotation: SharedValue<number>;
  segmentLayouts: SegmentLayout[];
  gesture: PanGesture;
  currentData: WheelItem[];
  state: WheelState;
  cx: number;
  cy: number;
  r: number;
}

export function useWheel(options: UseWheelOptions): UseWheelResult {
  const {
    data,
    size = DEFAULT_SIZE,
    weighted = false,
    controlledWinnerId,
    duration = DEFAULT_DURATION,
    removeWinnerOnSelect = false,
    disabled = false,
    theme,
    onSpinStart,
    onSpinEnd,
    onTick,
    onPointerCross,
    physics,
    ref,
  } = options;

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;

  // Resolve palette once per theme change — stable for string themes ('light'/'dark')
  // since resolveTheme returns module-level constants.
  const palette = useMemo(
    () => (theme != null ? resolveTheme(theme).palette : undefined),
    [theme]
  );

  // currentData starts from data; items may be removed via removeWinnerOnSelect
  const [currentData, setCurrentData] = useState<WheelItem[]>(data);

  // Sync with external data changes (e.g., caller updates the data prop)
  useEffect(() => {
    setCurrentData(data);
  }, [data]);

  const segmentLayouts = useSegments(currentData, cx, cy, r, palette);
  const { state, transitionTo } = useWheelState();

  // Holds the winner chosen at spin-start, consumed when animation finishes
  const pendingWinnerRef = useRef<WheelItem | null>(null);

  const handleSpinEnd = useCallback(() => {
    const winner = pendingWinnerRef.current;
    if (!winner) return;
    pendingWinnerRef.current = null;
    // spinning → idle is a valid transition
    transitionTo('idle');
    onSpinEnd?.(winner);
    if (removeWinnerOnSelect) {
      setCurrentData((prev) => prev.filter((item) => item.id !== winner.id));
    }
  }, [transitionTo, onSpinEnd, removeWinnerOnSelect]);

  // Map segment index → WheelItem for tick callbacks
  const handleTick = useCallback(
    (idx: number) => {
      const item = currentData[idx];
      if (item) onTick?.(item);
    },
    [currentData, onTick]
  );

  const handlePointerCross = useCallback(
    (idx: number) => {
      const item = currentData[idx];
      if (item) onPointerCross?.(item);
    },
    [currentData, onPointerCross]
  );

  const { rotation, startSpin, stopNow, resetRotation } = useWheelAnimation({
    // SegmentLayout satisfies SegmentAngle structurally
    segmentAngles: segmentLayouts,
    onSpinStart,
    onSpinEnd: handleSpinEnd,
    onTick: handleTick,
    onPointerCross: handlePointerCross,
    physics,
  });

  // Select a winner and begin the timed animation
  const performSpin = useCallback(
    (targetId?: string) => {
      if (state !== 'idle') return;

      let winner: WheelItem;
      try {
        if (targetId !== undefined) {
          winner = selectControlledWinner(currentData, targetId);
        } else if (weighted) {
          winner = selectWeightedWinner(currentData);
        } else {
          winner = selectRandomWinner(currentData);
        }
      } catch (err) {
        if (__DEV__) {
          console.warn('[@vap/react-native-wheel] performSpin error:', err);
        }
        return;
      }

      const winnerLayout = segmentLayouts.find((s) => s.id === winner.id);
      if (!winnerLayout) return;

      pendingWinnerRef.current = winner;
      transitionTo('spinning');
      startSpin(
        calculateTargetRotation(rotation.value, winnerLayout),
        duration
      );
    },
    [
      state,
      currentData,
      weighted,
      segmentLayouts,
      rotation,
      transitionTo,
      startSpin,
      duration,
    ]
  );

  const handleGestureEnd = useCallback(
    (angVelocity: number) => {
      if (Math.abs(angVelocity) < MIN_FLICK_DEG_PER_SEC) return;
      performSpin(controlledWinnerId);
    },
    [performSpin, controlledWinnerId]
  );

  const { gesture } = useWheelGesture({
    rotation,
    onGestureEnd: handleGestureEnd,
    enabled: state === 'idle' && !disabled,
    radius: r,
    cx,
    cy,
    physics,
  });

  useImperativeHandle(
    ref,
    () => ({
      spin: () => performSpin(controlledWinnerId),
      spinTo: (id: string) => performSpin(id),
      reset: () => {
        stopNow();
        pendingWinnerRef.current = null;
        transitionTo('idle');
        setCurrentData(data);
        resetRotation();
      },
      stop: () => {
        stopNow();
        pendingWinnerRef.current = null;
        transitionTo('idle');
      },
      replaceData: (newData: WheelItem[]) => {
        setCurrentData(newData);
      },
      getCurrentRotation: () => rotation.value,
    }),
    [
      performSpin,
      controlledWinnerId,
      stopNow,
      transitionTo,
      data,
      resetRotation,
      rotation,
    ]
  );

  return { rotation, segmentLayouts, gesture, currentData, state, cx, cy, r };
}
