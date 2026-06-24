# Architecture Overview

## High-Level Structure

```
react-native-wheel
│
├── src/types.ts               # Public TypeScript contracts
│
├── src/core/
│   ├── geometry.ts            # Pure math: SVG paths, polar coords, label positions
│   ├── segments.ts            # Segment angle computation + layout builder
│   ├── winner.ts              # Winner selection (random / weighted / controlled)
│   └── physics.ts             # Velocity conversion helpers
│
├── src/hooks/
│   ├── useWheelState.ts       # Wheel state machine (idle → spinning → stopped)
│   ├── useWheelAnimation.ts   # Reanimated rotation engine
│   ├── useWheelGesture.ts     # Pan gesture → angular delta
│   ├── useSegments.ts         # Memoised segment layout
│   └── useWheel.ts            # Master hook — wires everything together
│
└── src/components/
    ├── Wheel.tsx              # Public entry point, routes to renderer
    ├── WheelSVG.tsx           # SVG renderer (react-native-svg)
    ├── WheelSkia.tsx          # Skia renderer (@shopify/react-native-skia)
    ├── SectorSlice.tsx        # Individual segment (SVG)
    ├── Pointer.tsx            # Default 12-o'clock pointer arrow
    └── CenterDot.tsx          # Default centre circle overlay
```

## Renderer Abstraction

Both renderers accept the same props shape (`WheelSVGProps` / `WheelSkiaProps` are
structurally compatible). The entry `<Wheel>` component simply dispatches:

```
<Wheel renderer="svg"  ...>  →  <WheelSVG  rotation segmentLayouts gesture ... />
<Wheel renderer="skia" ...>  →  <WheelSkia rotation segmentLayouts gesture ... />
```

Skia is dynamically required and throws a clear error when the peer dep is absent.

## State Machine

```
         spin() / spinTo()
              │
    ┌─────────▼─────────┐
    │       idle         │◄────────────── reset() / stop()
    └─────────┬──────────┘
              │ startSpin(targetRotation, duration)
    ┌─────────▼──────────┐
    │      spinning       │
    └─────────┬──────────┘
              │ withTiming completes (or gesture ends → withDecay)
    ┌─────────▼──────────┐
    │    decelerating     │
    └─────────┬──────────┘
              │ velocity < minVelocity
    ┌─────────▼──────────┐
    │      stopped        │ → onSpinEnd(winner)
    └─────────┬──────────┘
              │ auto-transition
    ┌─────────▼──────────┐
    │        idle         │
    └────────────────────┘
```

Key invariants:
- `spin()` is a no-op unless `state === 'idle'`.
- `stop()` transitions from any state to `idle`.
- Gesture is disabled while `state !== 'idle'`.

## Data Flow

```
WheelProps (data, size, weighted, ...)
      │
      ▼
useSegments(data, size)
  ├── calculateSegmentAngles(items)    → SegmentAngle[]
  └── buildSegmentLayouts(...)         → SegmentLayout[]
      │
      ▼
useWheel(...)
  ├── useWheelAnimation(...)   → rotation (SharedValue<number>)
  ├── useWheelGesture(...)     → gesture (GestureType)
  └── winner selection logic
      │
      ▼
<WheelSVG> or <WheelSkia>
  └── renders each SegmentLayout as a sector path
```

## Animation Model

### Controlled spin (`spin()` / `spinTo()`)

Uses Reanimated `withTiming` with a cubic ease-out curve:

```
startSpin(targetRotation, duration)
  → withTiming(targetRotation, { duration, easing: Easing.out(Easing.cubic) })
```

`targetRotation` is calculated by `calculateTargetRotation()` in `core/winner.ts`
to guarantee the pointer lands on the winner's `midAngle`.

### Free-spin (gesture fling)

Uses Reanimated `withDecay`:

```
gesture.onEnd → startDecay(angularVelocity)
  → withDecay({ velocity: angularVelocity, deceleration: 0.998 })
```

The `deceleration` (0.998 by default) controls how quickly the wheel coasts to a stop.
Winner is determined by reading `rotation.value` when velocity drops below `minVelocity`.

### Tick detection

A `useDerivedValue` watches `rotation`, computes which segment index is currently under
the 12-o'clock pointer, and a `useAnimatedReaction` fires `runOnJS(onTick)` whenever
that index changes.

## Why Reanimated v4?

- All animation calculations run on the **UI thread** (worklets), guaranteeing 60 fps
  even when the JS thread is busy.
- `SharedValue<number>` is the single source of truth for rotation — both the SVG
  `animatedStyle` and the Skia `useDerivedValue` read it directly on the UI thread.
- `withDecay` and `withTiming` are both UI-thread primitives, so there is zero JS
  bridge overhead during the spin.

## Why react-native-svg as Primary?

- Widest platform support (iOS, Android, Web via `react-native-svg-web`).
- No additional native setup beyond CocoaPods / Gradle linking.
- SVG paths from `createSectorPath()` map 1:1 to `<Path d={...} />`.
- Skia renderer is fully opt-in — consumers that don't install
  `@shopify/react-native-skia` incur zero extra bundle cost.
