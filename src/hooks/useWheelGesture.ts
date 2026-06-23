import { cancelAnimation, useSharedValue } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { usePanGesture } from 'react-native-gesture-handler';
import type { PanGesture } from 'react-native-gesture-handler';

import { velocityToAngularVelocity } from '../core/physics';
import type { PhysicsConfig } from '../core/physics';

export interface UseWheelGestureOptions {
  rotation: SharedValue<number>;
  /** Called with angular velocity (deg/s) when the pan ends. */
  onGestureEnd: (angularVelocity: number) => void;
  /** Whether gesture recognition is enabled (disable during controlled spins). */
  enabled: boolean;
  /** Wheel radius in pixels — used to convert tangential velocity to deg/s. */
  radius: number;
  /** Centre X of the wheel view in its local coordinate space. */
  cx: number;
  /** Centre Y of the wheel view in its local coordinate space. */
  cy: number;
  physics?: PhysicsConfig;
}

export interface UseWheelGestureResult {
  gesture: PanGesture;
}

export function useWheelGesture(
  options: UseWheelGestureOptions
): UseWheelGestureResult {
  const { rotation, onGestureEnd, enabled, radius, cx, cy } = options;

  // Angle of the finger when it first touched, used to compute deltas
  const prevAngle = useSharedValue(0);
  // Snapshot of rotation.value at gesture start, so we can compute absolute angle
  const startRotation = useSharedValue(0);

  const gesture = usePanGesture({
    enabled,
    onBegin: (event) => {
      'worklet';
      cancelAnimation(rotation);
      startRotation.value = rotation.value;
      const dx = event.x - cx;
      const dy = event.y - cy;
      prevAngle.value = Math.atan2(dy, dx) * (180 / Math.PI);
    },
    onUpdate: (event) => {
      'worklet';
      const dx = event.x - cx;
      const dy = event.y - cy;
      const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);
      let delta = currentAngle - prevAngle.value;
      // Unwrap angle discontinuity at ±180°
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      rotation.value += delta;
      prevAngle.value = currentAngle;
    },
    onDeactivate: (event) => {
      'worklet';
      const dx = event.x - cx;
      const dy = event.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1) {
        scheduleOnRN(onGestureEnd, 0);
        return;
      }
      // Project velocity onto the tangential (clockwise) direction, convert
      // using the wheel radius for a consistent deg/s result
      const tangentialVelocity =
        (event.velocityX * -dy + event.velocityY * dx) / dist;
      const angVel = velocityToAngularVelocity(tangentialVelocity, radius);
      scheduleOnRN(onGestureEnd, angVel);
    },
  });

  return { gesture };
}
