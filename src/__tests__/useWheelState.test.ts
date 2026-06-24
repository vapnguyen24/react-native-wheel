import { act, renderHook } from '@testing-library/react-native';
import { describe, expect, it } from '@jest/globals';

import { useWheelState } from '../hooks/useWheelState';

describe('useWheelState', () => {
  it('initial state is idle', async () => {
    const { result } = await renderHook(() => useWheelState());
    expect(result.current.state).toBe('idle');
  });

  // ─── valid transitions ─────────────────────────────────────────────────────

  it('idle → spinning', async () => {
    const { result } = await renderHook(() => useWheelState());
    await act(() => result.current.transitionTo('spinning'));
    expect(result.current.state).toBe('spinning');
  });

  it('spinning → decelerating', async () => {
    const { result } = await renderHook(() => useWheelState());
    await act(() => result.current.transitionTo('spinning'));
    await act(() => result.current.transitionTo('decelerating'));
    expect(result.current.state).toBe('decelerating');
  });

  it('spinning → stopped', async () => {
    const { result } = await renderHook(() => useWheelState());
    await act(() => result.current.transitionTo('spinning'));
    await act(() => result.current.transitionTo('stopped'));
    expect(result.current.state).toBe('stopped');
  });

  it('spinning → idle (cancel)', async () => {
    const { result } = await renderHook(() => useWheelState());
    await act(() => result.current.transitionTo('spinning'));
    await act(() => result.current.transitionTo('idle'));
    expect(result.current.state).toBe('idle');
  });

  it('decelerating → stopped', async () => {
    const { result } = await renderHook(() => useWheelState());
    await act(() => result.current.transitionTo('spinning'));
    await act(() => result.current.transitionTo('decelerating'));
    await act(() => result.current.transitionTo('stopped'));
    expect(result.current.state).toBe('stopped');
  });

  it('decelerating → idle', async () => {
    const { result } = await renderHook(() => useWheelState());
    await act(() => result.current.transitionTo('spinning'));
    await act(() => result.current.transitionTo('decelerating'));
    await act(() => result.current.transitionTo('idle'));
    expect(result.current.state).toBe('idle');
  });

  it('stopped → idle', async () => {
    const { result } = await renderHook(() => useWheelState());
    await act(() => result.current.transitionTo('spinning'));
    await act(() => result.current.transitionTo('stopped'));
    await act(() => result.current.transitionTo('idle'));
    expect(result.current.state).toBe('idle');
  });

  it('stopped → spinning (re-spin immediately)', async () => {
    const { result } = await renderHook(() => useWheelState());
    await act(() => result.current.transitionTo('spinning'));
    await act(() => result.current.transitionTo('stopped'));
    await act(() => result.current.transitionTo('spinning'));
    expect(result.current.state).toBe('spinning');
  });

  // ─── invalid transitions — state must not change ───────────────────────────

  it('idle → stopped is rejected', async () => {
    const { result } = await renderHook(() => useWheelState());
    await act(() => result.current.transitionTo('stopped'));
    expect(result.current.state).toBe('idle');
  });

  it('idle → decelerating is rejected', async () => {
    const { result } = await renderHook(() => useWheelState());
    await act(() => result.current.transitionTo('decelerating'));
    expect(result.current.state).toBe('idle');
  });

  it('stopped → decelerating is rejected', async () => {
    const { result } = await renderHook(() => useWheelState());
    await act(() => result.current.transitionTo('spinning'));
    await act(() => result.current.transitionTo('stopped'));
    await act(() => result.current.transitionTo('decelerating'));
    expect(result.current.state).toBe('stopped');
  });

  it('decelerating → spinning is rejected', async () => {
    const { result } = await renderHook(() => useWheelState());
    await act(() => result.current.transitionTo('spinning'));
    await act(() => result.current.transitionTo('decelerating'));
    await act(() => result.current.transitionTo('spinning'));
    expect(result.current.state).toBe('decelerating');
  });

  it('transitionTo is stable across re-renders', async () => {
    const { result, rerender } = await renderHook(() => useWheelState());
    const firstTransitionTo = result.current.transitionTo;
    await rerender({});
    expect(result.current.transitionTo).toBe(firstTransitionTo);
  });
});
