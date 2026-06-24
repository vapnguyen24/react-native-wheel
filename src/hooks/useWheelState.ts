import { useCallback, useState } from 'react';

import type { WheelState } from '../types';

const VALID_TRANSITIONS: Readonly<Record<WheelState, readonly WheelState[]>> = {
  idle: ['idle', 'spinning'],
  spinning: ['decelerating', 'stopped', 'idle'],
  decelerating: ['stopped', 'idle'],
  stopped: ['idle', 'spinning'],
};

export interface UseWheelStateResult {
  state: WheelState;
  transitionTo: (next: WheelState) => void;
}

export function useWheelState(): UseWheelStateResult {
  const [state, setStateInternal] = useState<WheelState>('idle');

  const transitionTo = useCallback((next: WheelState) => {
    setStateInternal((current) => {
      const allowed = VALID_TRANSITIONS[current];
      if (!allowed.includes(next)) {
        if (__DEV__) {
          console.warn(
            `[@vapng/react-native-wheel] Invalid state transition: ${current} → ${next}`
          );
        }
        return current;
      }
      return next;
    });
  }, []);

  return { state, transitionTo };
}
