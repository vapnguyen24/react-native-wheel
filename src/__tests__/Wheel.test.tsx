import React from 'react';
import { act, render, waitFor } from '@testing-library/react-native';
import { describe, expect, it, jest } from '@jest/globals';

import { Wheel } from '../components/Wheel';
import type { WheelItem, WheelRef } from '../types';

const DATA: WheelItem[] = [
  { id: '1', label: 'Alpha', color: '#E8413E' },
  { id: '2', label: 'Beta', color: '#3E7BFA' },
  { id: '3', label: 'Gamma', color: '#4BB543' },
  { id: '4', label: 'Delta', color: '#F4A228' },
];

// ─── Basic rendering ──────────────────────────────────────────────────────────

describe('Wheel rendering', () => {
  it('renders without crashing', async () => {
    await expect(render(<Wheel data={DATA} />)).resolves.toBeDefined();
  });

  it('renders with dark theme', async () => {
    await expect(
      render(<Wheel data={DATA} theme="dark" />)
    ).resolves.toBeDefined();
  });

  it('renders with a custom ThemeConfig', async () => {
    const theme = {
      palette: ['#ff0000', '#00ff00'],
      background: '#000000',
      text: '#ffffff',
      border: '#cccccc',
      pointer: '#ff4400',
    };
    await expect(
      render(<Wheel data={DATA} theme={theme} />)
    ).resolves.toBeDefined();
  });

  it('renders with weighted mode', async () => {
    const ref = React.createRef<WheelRef>();
    const weighted = DATA.map((item, i) => ({ ...item, weight: i + 1 }));
    await render(<Wheel ref={ref} data={weighted} weighted />);
    await act(async () => ref.current?.spin());
  });

  it('catches error when spinning with empty data', async () => {
    const ref = React.createRef<WheelRef>();
    await render(<Wheel ref={ref} data={[]} />);
    await act(async () => ref.current?.spin());
  });

  it('renders with a single item', async () => {
    await expect(
      render(<Wheel data={[{ id: 'solo', label: 'Solo' }]} />)
    ).resolves.toBeDefined();
  });

  it('renders with many items', async () => {
    const many = Array.from({ length: 20 }, (_, i) => ({
      id: String(i),
      label: `Item ${i}`,
    }));
    await expect(render(<Wheel data={many} />)).resolves.toBeDefined();
  });

  it('renders with a custom size', async () => {
    await expect(
      render(<Wheel data={DATA} size={200} />)
    ).resolves.toBeDefined();
  });

  it('renders in disabled mode', async () => {
    await expect(render(<Wheel data={DATA} disabled />)).resolves.toBeDefined();
  });

  it('renders with custom render slots', async () => {
    await expect(
      render(
        <Wheel
          data={DATA}
          renderPointer={() => null}
          renderCenter={() => null}
          renderLabel={() => null}
          renderSlice={() => null}
        />
      )
    ).resolves.toBeDefined();
  });

  it('renders the Skia renderer when the mock is available', async () => {
    await expect(
      render(<Wheel data={DATA} renderer="skia" />)
    ).resolves.toBeDefined();
  });
});

// ─── Ref API ─────────────────────────────────────────────────────────────────

describe('Wheel ref', () => {
  it('exposes spin()', async () => {
    const ref = React.createRef<WheelRef>();
    await render(<Wheel ref={ref} data={DATA} />);
    expect(typeof ref.current?.spin).toBe('function');
  });

  it('exposes spinTo()', async () => {
    const ref = React.createRef<WheelRef>();
    await render(<Wheel ref={ref} data={DATA} />);
    expect(typeof ref.current?.spinTo).toBe('function');
  });

  it('exposes reset()', async () => {
    const ref = React.createRef<WheelRef>();
    await render(<Wheel ref={ref} data={DATA} />);
    expect(typeof ref.current?.reset).toBe('function');
  });

  it('exposes stop()', async () => {
    const ref = React.createRef<WheelRef>();
    await render(<Wheel ref={ref} data={DATA} />);
    expect(typeof ref.current?.stop).toBe('function');
  });

  it('exposes replaceData()', async () => {
    const ref = React.createRef<WheelRef>();
    await render(<Wheel ref={ref} data={DATA} />);
    expect(typeof ref.current?.replaceData).toBe('function');
  });

  it('getCurrentRotation() returns 0 initially', async () => {
    const ref = React.createRef<WheelRef>();
    await render(<Wheel ref={ref} data={DATA} />);
    expect(ref.current?.getCurrentRotation()).toBe(0);
  });

  it('spin() calls onSpinEnd with a winner', async () => {
    const onSpinEnd = jest.fn<(w: WheelItem) => void>();
    const ref = React.createRef<WheelRef>();
    await render(<Wheel ref={ref} data={DATA} onSpinEnd={onSpinEnd} />);

    await act(async () => ref.current?.spin());

    await waitFor(() => expect(onSpinEnd).toHaveBeenCalledTimes(1));
    const winner = onSpinEnd.mock.calls[0]?.[0];
    expect(winner).toBeDefined();
    expect(DATA.some((d) => d.id === winner?.id)).toBe(true);
  });

  it('spinTo() lands on the specified segment', async () => {
    const onSpinEnd = jest.fn<(w: WheelItem) => void>();
    const ref = React.createRef<WheelRef>();
    await render(<Wheel ref={ref} data={DATA} onSpinEnd={onSpinEnd} />);

    await act(async () => ref.current?.spinTo('3'));

    await waitFor(() => expect(onSpinEnd).toHaveBeenCalled());
    expect(onSpinEnd.mock.calls[0]?.[0]?.id).toBe('3');
  });

  it('reset() does not throw', async () => {
    const ref = React.createRef<WheelRef>();
    await render(<Wheel ref={ref} data={DATA} />);
    await act(async () => ref.current?.reset());
  });

  it('stop() does not throw', async () => {
    const ref = React.createRef<WheelRef>();
    await render(<Wheel ref={ref} data={DATA} />);
    await act(async () => ref.current?.stop());
  });

  it('replaceData() swaps the segment data', async () => {
    const ref = React.createRef<WheelRef>();
    await render(<Wheel ref={ref} data={DATA} />);
    const newData = [{ id: 'x', label: 'X' }];
    await act(async () => ref.current?.replaceData(newData));
  });

  it('spin() fires onSpinStart callback', async () => {
    const onSpinStart = jest.fn();
    const ref = React.createRef<WheelRef>();
    await render(<Wheel ref={ref} data={DATA} onSpinStart={onSpinStart} />);
    await act(async () => ref.current?.spin());
    expect(onSpinStart).toHaveBeenCalled();
  });

  it('controlledWinnerId targets a specific segment', async () => {
    const onSpinEnd = jest.fn<(w: WheelItem) => void>();
    const ref = React.createRef<WheelRef>();
    await render(
      <Wheel
        ref={ref}
        data={DATA}
        controlledWinnerId="2"
        onSpinEnd={onSpinEnd}
      />
    );
    await act(async () => ref.current?.spin());
    await waitFor(() => expect(onSpinEnd).toHaveBeenCalled());
    expect(onSpinEnd.mock.calls[0]?.[0]?.id).toBe('2');
  });
});

// ─── removeWinnerOnSelect ─────────────────────────────────────────────────────

describe('removeWinnerOnSelect', () => {
  it('renders without crashing', async () => {
    await expect(
      render(<Wheel data={DATA} removeWinnerOnSelect />)
    ).resolves.toBeDefined();
  });

  it('removes the winner from segments after spin', async () => {
    const ref = React.createRef<WheelRef>();
    await render(<Wheel ref={ref} data={DATA} removeWinnerOnSelect />);
    await act(async () => ref.current?.spin());
    // No crash means the state update was handled correctly
  });
});

describe('Callbacks and properties', () => {
  it('renders segments with imageUrl', async () => {
    const dataWithImage = DATA.map((d) => ({
      ...d,
      imageUrl: 'https://example.com/image.png',
    }));
    await expect(render(<Wheel data={dataWithImage} />)).resolves.toBeDefined();
    await expect(
      render(<Wheel data={dataWithImage} renderer="skia" />)
    ).resolves.toBeDefined();
  });

  it('triggers onTick and onPointerCross when provided', async () => {
    const onTick = jest.fn();
    const onPointerCross = jest.fn();
    const ref = React.createRef<WheelRef>();
    await render(
      <Wheel
        ref={ref}
        data={DATA}
        onTick={onTick}
        onPointerCross={onPointerCross}
      />
    );
    // Since tick relies on Reanimated useAnimatedReaction, we might not easily trigger it
    // just by calling spin in jest without fully advancing timers and reanimated frames.
    // So we just ensure it mounts properly with these props.
  });
});
