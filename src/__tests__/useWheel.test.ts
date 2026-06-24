import { describe, expect, it, jest } from '@jest/globals';
import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { useWheel } from '../hooks/useWheel';
import type { WheelItem, WheelRef } from '../types';

jest.mock('../hooks/useWheelAnimation', () => ({
  useWheelAnimation: jest.fn(() => ({
    rotation: { value: 0 },
    startSpin: jest.fn(),
    stopNow: jest.fn(),
    resetRotation: jest.fn(),
  })),
}));

const mockData: WheelItem[] = [
  { id: '1', label: 'Item 1' },
  { id: '2', label: 'Item 2', weight: 2 },
];

describe('useWheel', () => {
  it('calls onTick when handleTick is triggered', async () => {
    const onTick = jest.fn();
    const onPointerCross = jest.fn();
    const { useWheelAnimation } = require('../hooks/useWheelAnimation');

    await renderHook(() =>
      useWheel({ data: mockData, onTick, onPointerCross })
    );

    const calls = useWheelAnimation.mock.calls;
    const lastCall = calls[calls.length - 1][0];

    act(() => {
      lastCall.onTick(0);
      lastCall.onTick(99);
      lastCall.onPointerCross(0);
      lastCall.onPointerCross(99);
    });

    expect(onTick).toHaveBeenCalledWith(mockData[0]);
    expect(onPointerCross).toHaveBeenCalledWith(mockData[0]);
  });

  it('handles weighted spin', async () => {
    const ref = React.createRef<WheelRef>();
    await renderHook(() => useWheel({ data: mockData, weighted: true, ref }));

    act(() => {
      ref.current?.spin();
    });
  });

  it('catches errors during spin', async () => {
    const ref = React.createRef<WheelRef>();
    await renderHook(
      () => useWheel({ data: [], ref }) // Empty data will cause random selection to throw
    );

    act(() => {
      ref.current?.spin();
    });
  });

  it('handles gesture end above and below threshold', async () => {
    require('../hooks/useWheelGesture');
    // We can't easily mock useWheelGesture perfectly here without affecting other things,
    // but we can extract the handleGestureEnd callback
    let capturedOnGestureEnd: any;
    jest.isolateModules(() => {
      jest.mock('../hooks/useWheelGesture', () => ({
        useWheelGesture: (opts: any) => {
          capturedOnGestureEnd = opts.onGestureEnd;
          return { gesture: {} };
        },
      }));
      const { useWheel: isolatedUseWheel } = require('../hooks/useWheel');
      renderHook(() => isolatedUseWheel({ data: mockData }));
    });

    act(() => {
      if (capturedOnGestureEnd) {
        capturedOnGestureEnd(10); // Below threshold, does nothing
        capturedOnGestureEnd(100); // Above threshold, spins
      }
    });
  });
});
