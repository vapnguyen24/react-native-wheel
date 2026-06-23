# CLAUDE.md — react-native-wheel

## Project Goal

Build the best wheel spinner library in the React Native ecosystem.
Replace outdated wheel-of-fortune libraries with a modern, production-grade solution.
Publishable to npm without major modifications.

---

## Scaffold Context

The project was bootstrapped with `create-react-native-library` (react-native-builder-bob 0.43).
Build system: `yarn bob build` → outputs `lib/module/` (ESM) and `lib/typescript/`.
Monorepo via Yarn workspaces: root = library, `example/` = demo app.
CI: GitHub Actions (`.github/workflows/ci.yml`).

**Current state:** only the default `multiply` stub exists in `src/`. Everything must be built from scratch.

---

## Constraints — MUST follow

### Dependencies to ADD
- `react-native-reanimated` v4 (peer dep)
- `react-native-svg` (peer dep)
- `react-native-gesture-handler` (peer dep)
- `@shopify/react-native-skia` (optional peer dep, for `renderer="skia"`)

### Dependencies — NEVER use
- `d3` or any d3-shape package
- The legacy `Animated` API from `react-native`
- Any native module that requires a custom native bridge (no turbo module wrapping needed beyond what Reanimated/SVG already ship)
- Redux, Zustand, or any external state library

### Animation rules
- All animations run on the UI thread via Reanimated worklets
- Use `useSharedValue`, `withTiming`, `withDecay`, `useAnimatedStyle`
- Never call animation functions from JS-thread event handlers without `runOnUI`

### Geometry rules
- Implement all math from scratch — no d3-shape
- Required functions (export from `src/core/geometry.ts`):
  - `polarToCartesian(cx, cy, r, angleDeg)` → `{x: number, y: number}`
  - `createSectorPath(cx, cy, r, startAngle, endAngle)` → `string` (SVG path d)
  - `calculateLabelPosition(cx, cy, r, startAngle, endAngle, offset?)` → `{x, y, rotation}`
  - `calculateImagePosition(cx, cy, r, startAngle, endAngle)` → `{x, y, width, height}`

---

## Architecture

### Renderer Pattern

```
<Wheel renderer="svg" />   → WheelSVG (react-native-svg)
<Wheel renderer="skia" />  → WheelSkia (@shopify/react-native-skia)
```

Business logic (state, physics, winner selection, gesture) lives in shared hooks.
Renderers only receive computed layout data and a shared rotation value.
Switching renderer never changes business logic.

### Winner Modes

| Mode | Prop | Who decides |
|------|------|-------------|
| Random | (none) | Library — uniform random |
| Weighted | `weighted` | Library — weight-proportional random |
| Controlled | `controlledWinnerId="id"` | Caller — must land EXACTLY on segment |

The controlled mode is the most critical correctness requirement.

### State Machine

```
idle → spinning → decelerating → stopped → idle
```

Transitions driven by Reanimated `runOnJS` callbacks. Never manipulate state from worklets directly.

---

## Public API (source of truth)

### WheelItem

```ts
export interface WheelItem {
  id: string;
  label: string;
  color?: string;
  weight?: number;
  imageUrl?: string;
  disabled?: boolean;
  metadata?: Record<string, unknown>;
}
```

### WheelProps

```ts
export interface WheelProps {
  data: WheelItem[];
  renderer?: 'svg' | 'skia';
  size?: number;                        // default 320
  duration?: number;                    // ms, default 5000
  weighted?: boolean;
  controlledWinnerId?: string;
  removeWinnerOnSelect?: boolean;
  onSpinStart?: () => void;
  onSpinEnd?: (winner: WheelItem) => void;
  onTick?: (item: WheelItem) => void;
  onPointerCross?: (item: WheelItem) => void;
  // custom renderers
  renderPointer?: () => React.ReactNode;
  renderCenter?: () => React.ReactNode;
  renderLabel?: (item: WheelItem, index: number) => React.ReactNode;
  renderSlice?: (item: WheelItem, index: number) => React.ReactNode;
  // theme
  theme?: 'light' | 'dark' | ThemeConfig;
  // accessibility
  accessibilityLabel?: string;
}
```

### WheelRef

```ts
export interface WheelRef {
  spin(): void;
  spinTo(id: string): void;
  reset(): void;
  stop(): void;
  replaceData(data: WheelItem[]): void;
  getCurrentRotation(): number;
}
```

---

## Folder Structure

```
src/
  index.tsx                    # public re-exports only
  types.ts                     # all public types and interfaces
  components/
    Wheel.tsx                  # main component — prop routing + renderer switch
    WheelSVG.tsx               # SVG renderer (react-native-svg)
    WheelSkia.tsx              # Skia renderer (@shopify/react-native-skia)
    Pointer.tsx                # default pointer component
    CenterDot.tsx              # default center component
  core/
    geometry.ts                # polarToCartesian, createSectorPath, etc.
    physics.ts                 # angularVelocity, friction, deceleration helpers
    winner.ts                  # random / weighted / controlled winner selection
    segments.ts                # segment angle calculation from WheelItem[]
  hooks/
    useWheelAnimation.ts       # Reanimated shared values + withTiming/withDecay
    useWheelGesture.ts         # Gesture Handler pan/flick → angular velocity
    useWheelRef.ts             # imperative handle (forwardRef)
    useWheelState.ts           # idle/spinning/decelerating/stopped state machine
    useSegments.ts             # memoized segment layout from data
  utils/
    math.ts                    # clamp, normalizeAngle, lerp
    colors.ts                  # default palette, color utilities
    image.ts                   # image caching (simple Map-based)
  themes/
    index.ts                   # light, dark, ThemeConfig type
  __tests__/
    geometry.test.ts
    winner.test.ts
    physics.test.ts
    segments.test.ts
    Wheel.test.tsx
example/
  src/
    screens/
      BasicScreen.tsx
      WeightedScreen.tsx
      ControlledScreen.tsx
      ImageWheelScreen.tsx
      CustomPointerScreen.tsx
      CustomCenterScreen.tsx
```

---

## Coding Conventions

- TypeScript strict mode — no `any`, no `@ts-ignore`
- Functional components only, no class components
- Custom hooks for all logic — components are thin wrappers
- `React.memo` on all renderer components
- Memoize segment geometry with `useMemo` keyed on `data` reference
- No inline styles for computed geometry — pass as props or via `useAnimatedStyle`
- No comments explaining what code does. Only add comments for non-obvious WHY
- File length limit: aim for < 250 lines; split if larger
- Export only from `src/index.tsx` — nothing else is public

---

## Testing Rules

- Jest + React Native Testing Library
- Target: 90%+ coverage
- `geometry.test.ts` must test all four geometry functions with known values
- `winner.test.ts` must prove weighted distribution and controlled exactness
- Animation tests: use `@testing-library/react-native` + Reanimated test utils
- No snapshot tests for geometry — use exact numeric assertions with `toBeCloseTo`

---

## Performance Budget

| Segments | Target FPS |
|----------|-----------|
| 10       | 60        |
| 50       | 60        |
| 100      | 60        |
| 500      | ≥ 30      |

Segment paths are computed once (not per frame). Rotation is a single transform on the entire wheel group.

---

## Sound & Haptics Policy

Do NOT bundle sound or haptic libraries.
Expose callbacks only: `onTick`, `onPointerCross`, `onSpinStart`, `onSpinEnd`.
The consumer is responsible for playing sounds or triggering haptics in these callbacks.

---

## Accessibility Requirements

- `accessibilityRole="spinbutton"` on the wheel container
- `accessibilityLabel` prop forwarded
- VoiceOver / TalkBack: announce winner on spin end
- Keyboard: space/enter triggers spin, arrow keys adjust if applicable
- All interactive elements must have `accessible={true}`

---

## Package Quality

- ESM output via bob (`module` target with `esm: true`)
- CJS not strictly required by bob's defaults but declarations must ship
- `lib/typescript/src/index.d.ts` must export all public types
- Tree-shaking: no barrel re-exports of implementation files, only from `index.tsx`
- Source maps generated by bob automatically

---

## What NOT to do

- Do not import from `react-native`'s `Animated` — use Reanimated only
- Do not use `useNativeDriver: true` pattern — Reanimated handles this natively
- Do not add Redux/Zustand/Context for wheel state — hooks only
- Do not call `setState` from worklets — use `runOnJS`
- Do not hardcode segment colors without falling back to the theme palette
- Do not break the renderer abstraction — shared hooks must not import SVG or Skia
