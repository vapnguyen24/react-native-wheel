import { useCallback, useEffect, useRef } from 'react';
import {
  cancelAnimation,
  Easing,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withDecay,
  withTiming,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { computeCurrentSegmentIndex } from '../core/geometry';
import { resolvePhysicsConfig } from '../core/physics';
import type { PhysicsConfig } from '../core/physics';
import type { SegmentAngle } from '../types';

export interface UseWheelAnimationOptions {
  segmentAngles: readonly SegmentAngle[];
  onSpinStart?: () => void;
  onSpinEnd?: () => void;
  onTick?: (segmentIndex: number) => void;
  onPointerCross?: (segmentIndex: number) => void;
  physics?: PhysicsConfig;
}

export interface UseWheelAnimationResult {
  rotation: SharedValue<number>;
  startSpin: (targetRotation: number, duration: number) => void;
  startDecay: (initialVelocityDegPerSec: number) => void;
  stopNow: () => void;
  resetRotation: () => void;
}

export function useWheelAnimation(
  options: UseWheelAnimationOptions
): UseWheelAnimationResult {
  const {
    segmentAngles,
    onSpinStart,
    onSpinEnd,
    onTick,
    onPointerCross,
    physics,
  } = options;

  const rotation = useSharedValue(0);

  // Stable refs so UI-thread worklets always invoke the latest JS callbacks
  const onSpinEndRef = useRef(onSpinEnd);
  const onTickRef = useRef(onTick);
  const onPointerCrossRef = useRef(onPointerCross);
  useEffect(() => {
    onSpinEndRef.current = onSpinEnd;
  }, [onSpinEnd]);
  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);
  useEffect(() => {
    onPointerCrossRef.current = onPointerCross;
  }, [onPointerCross]);

  const callOnSpinEnd = useCallback(() => {
    onSpinEndRef.current?.();
  }, []);

  const callOnTick = useCallback((idx: number) => {
    onTickRef.current?.(idx);
  }, []);

  const callOnPointerCross = useCallback((idx: number) => {
    onPointerCrossRef.current?.(idx);
  }, []);

  const startSpin = useCallback(
    (targetRotation: number, duration: number) => {
      onSpinStart?.();
      rotation.value = withTiming(
        targetRotation,
        { duration, easing: Easing.out(Easing.quad) },
        (finished) => {
          'worklet';
          if (finished) {
            scheduleOnRN(callOnSpinEnd);
          }
        }
      );
    },

    [rotation, onSpinStart, callOnSpinEnd]
  );

  const startDecay = useCallback(
    (initialVelocityDegPerSec: number) => {
      const resolved = resolvePhysicsConfig(physics);
      rotation.value = withDecay(
        {
          velocity: initialVelocityDegPerSec,
          deceleration: resolved.deceleration,
        },
        (finished) => {
          'worklet';
          if (finished) {
            scheduleOnRN(callOnSpinEnd);
          }
        }
      );
    },
    [rotation, physics, callOnSpinEnd]
  );

  const stopNow = useCallback(() => {
    cancelAnimation(rotation);
  }, [rotation]);

  const resetRotation = useCallback(() => {
    cancelAnimation(rotation);
    rotation.value = 0;
  }, [rotation]);

  // Tick detection: compute current segment on every frame via UI thread
  const currentSegmentIdx = useDerivedValue(() => {
    return computeCurrentSegmentIndex(rotation.value, segmentAngles);
  }, [segmentAngles]);

  useAnimatedReaction(
    () => currentSegmentIdx.value,
    (current, previous) => {
      if (previous !== null && current !== previous) {
        scheduleOnRN(callOnTick, current);
        scheduleOnRN(callOnPointerCross, current);
      }
    },
    [callOnTick, callOnPointerCross]
  );

  return { rotation, startSpin, startDecay, stopNow, resetRotation };
}
