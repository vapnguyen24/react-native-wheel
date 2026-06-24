import { describe, expect, it, jest } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';
import { useWheelGesture } from '../hooks/useWheelGesture';

jest.mock('react-native-gesture-handler', () => ({
  usePanGesture: jest.fn((config: any) => config),
  Gesture: {
    Pan: jest.fn(() => ({
      enabled: jest.fn().mockReturnThis(),
      onBegin: jest.fn().mockReturnThis(),
      onUpdate: jest.fn().mockReturnThis(),
      onEnd: jest.fn().mockReturnThis(),
      onFinalize: jest.fn().mockReturnThis(),
    })),
  },
}));

describe('useWheelGesture', () => {
  it('initializes and handles gesture events', async () => {
    const rotation = { value: 0 };
    const onGestureEnd = jest.fn();

    const { result } = await renderHook(() =>
      useWheelGesture({
        rotation: rotation as any,
        onGestureEnd,
        enabled: true,
        radius: 100,
        cx: 100,
        cy: 100,
      })
    );

    const gestureConfig = result.current.gesture as any;

    expect(gestureConfig.enabled).toBe(true);

    // Simulate onBegin
    gestureConfig.onBegin({ x: 150, y: 150 });

    // Simulate onUpdate
    gestureConfig.onUpdate({ x: 100, y: 200 }); // some movement

    // Simulate onDeactivate with small distance (dist < 1)
    gestureConfig.onDeactivate({ x: 100, y: 100, velocityX: 0, velocityY: 0 });
    expect(onGestureEnd).toHaveBeenCalled();

    // Simulate onDeactivate with larger movement
    gestureConfig.onDeactivate({
      x: 200,
      y: 200,
      velocityX: 100,
      velocityY: -100,
    });
  });
});
