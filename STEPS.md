# STEPS.md — Implementation Plan for react-native-wheel

## Reading Guide

Each phase builds on the previous. Phases 1–5 are the hard core — get these right before touching rendering.
Phases marked **[BLOCKER]** must be completed before the next phase begins.
Estimated effort is relative (S/M/L/XL).

---

## Phase 0 — Dependencies & Package Setup [BLOCKER] (S)

**Goal:** Install all required libraries and configure the package manifest correctly.

### 0.1 — Add peer dependencies to `package.json`

```json
"peerDependencies": {
  "react": "*",
  "react-native": "*",
  "react-native-reanimated": ">=4.0.0",
  "react-native-svg": ">=15.0.0",
  "react-native-gesture-handler": ">=2.0.0"
},
"peerDependenciesMeta": {
  "@shopify/react-native-skia": { "optional": true }
}
```

### 0.2 — Add to `devDependencies` (for local dev/example)

- `react-native-reanimated@^4`
- `react-native-svg@^15`
- `react-native-gesture-handler@^2`
- `@shopify/react-native-skia` (optional)
- `@testing-library/react-native`
- `@testing-library/jest-native`

### 0.3 — Configure Reanimated in `babel.config.js`

Add `'react-native-reanimated/plugin'` as last Babel plugin.

### 0.4 — Clean up default scaffold

Remove `src/multiply.tsx` and its export from `src/index.tsx`.

### 0.5 — Verify build pipeline

Run `yarn typecheck` and `yarn build` — should succeed with empty exports.

---

## Phase 1 — Types & Public API [BLOCKER] (S)

**Goal:** Define all TypeScript interfaces before writing any implementation.
This is the contract everything else depends on.

### 1.1 — Create `src/types.ts`

Define and export:

- `WheelItem` interface (id, label, color, weight, imageUrl, disabled, metadata)
- `WheelRef` interface (spin, spinTo, reset, stop, replaceData, getCurrentRotation)
- `WheelProps` interface (data, renderer, size, duration, weighted, controlledWinnerId, removeWinnerOnSelect, onSpinStart, onSpinEnd, onTick, onPointerCross, renderPointer, renderCenter, renderLabel, renderSlice, theme, accessibilityLabel)
- `ThemeConfig` interface (background, text, border, palette: string[])
- `RendererType = 'svg' | 'skia'`
- `WheelState = 'idle' | 'spinning' | 'decelerating' | 'stopped'`
- `SegmentLayout` — computed geometry per segment (startAngle, endAngle, midAngle, path, labelPos, imagePos, color)

### 1.2 — Update `src/index.tsx`

Re-export all public types and the `Wheel` component (stub for now).

---

## Phase 2 — Geometry Engine [BLOCKER] (M)

**Goal:** All math for rendering sectors. No rendering yet — pure functions only.

### 2.1 — Create `src/utils/math.ts`

```ts
clamp(value, min, max): number
normalizeAngle(deg): number          // → [0, 360)
degreesToRadians(deg): number
radiansToDegrees(rad): number
lerp(a, b, t): number
```

### 2.2 — Create `src/core/geometry.ts`

Implement four required functions:

```ts
polarToCartesian(cx, cy, r, angleDeg): { x: number; y: number }
```
Standard formula: `x = cx + r * cos(θ)`, `y = cy + r * sin(θ)`.
SVG coordinate system: 0° = 3 o'clock, increases clockwise.

```ts
createSectorPath(cx, cy, r, startAngle, endAngle): string
```
Returns an SVG path `d` string for a pie sector.
Handle full-circle edge case (360° arc must use two 180° arcs).
Use `largeArcFlag = endAngle - startAngle > 180 ? 1 : 0`.

```ts
calculateLabelPosition(cx, cy, r, startAngle, endAngle, radiusRatio?): { x, y, rotation }
```
Place label at `midAngle = (startAngle + endAngle) / 2`, at `r * radiusRatio` (default 0.65).
`rotation` = midAngle (text faces outward).

```ts
calculateImagePosition(cx, cy, r, startAngle, endAngle): { x, y, width, height }
```
Place image slightly closer to center, centered on midAngle.
`width = height = r * 0.18` (reasonable default, allow override).

### 2.3 — Create `src/core/segments.ts`

```ts
calculateSegmentAngles(items: WheelItem[]): SegmentAngle[]
```

- Equal division when no `weight` fields are set
- Proportional division when any item has `weight`
- Disabled items still rendered but skipped in winner selection
- Returns `{ id, startAngle, endAngle, midAngle }[]`

```ts
buildSegmentLayouts(items, angles, cx, cy, r): SegmentLayout[]
```

Calls geometry functions to compute full layout per segment.
Memoization hint: only recompute when `items` reference changes.

### 2.4 — Write tests: `src/__tests__/geometry.test.ts`

Test cases (use exact values with `toBeCloseTo`):
- `polarToCartesian(100, 100, 50, 0)` → `{x: 150, y: 100}`
- `polarToCartesian(100, 100, 50, 90)` → `{x: 100, y: 150}`
- `createSectorPath` for 90° sector — verify it contains `A` arc command and correct flags
- `calculateLabelPosition` midpoint correctness
- `calculateSegmentAngles` — 4 equal items each get 90°
- `calculateSegmentAngles` — weighted: items [1,2,3] get proportional angles

---

## Phase 3 — Winner Selection Logic [BLOCKER] (M)

**Goal:** Three winner modes, all deterministic and testable.

### 3.1 — Create `src/core/winner.ts`

```ts
selectRandomWinner(items: WheelItem[]): WheelItem
```
Uniform random from non-disabled items.

```ts
selectWeightedWinner(items: WheelItem[]): WheelItem
```
Weight-proportional random using cumulative sum and `Math.random()`.
Items without `weight` default to weight=1.
Disabled items excluded.

```ts
selectControlledWinner(items: WheelItem[], id: string): WheelItem
```
Find item by `id`. Throw if not found or disabled.

```ts
calculateTargetRotation(
  currentRotation: number,
  winnerAngle: SegmentAngle,
  minSpins?: number
): number
```
Returns a rotation (in degrees) that:
1. Adds at least `minSpins * 360°` (default 5 full rotations)
2. Lands the pointer exactly at `winnerAngle.midAngle`
Pointer is at top (270° in standard SVG coords, or treat as 12 o'clock).

Formula:
```
pointerAngle = 270  // degrees (12 o'clock)
targetSegmentAngle = winnerMidAngle
// How much extra rotation to add so targetSegmentAngle aligns with pointer
offset = (pointerAngle - targetSegmentAngle + 360) % 360
targetRotation = currentRotation + (minSpins * 360) + offset
```

### 3.2 — Write tests: `src/__tests__/winner.test.ts`

- `selectWeightedWinner` distribution: run 10,000 iterations, assert proportions within ±5%
- `selectControlledWinner` returns exact item for matching id
- `selectControlledWinner` throws on unknown id
- `calculateTargetRotation` result: when applied, segment midAngle aligns with pointer
- Winner accuracy: given target rotation, `targetRotation % 360` maps to correct segment

---

## Phase 4 — Animation & Physics Core [BLOCKER] (L)

**Goal:** Reanimated-based rotation engine. No rendering yet.

### 4.1 — Create `src/hooks/useWheelState.ts`

```ts
const { state, setState } = useWheelState()
// state: 'idle' | 'spinning' | 'decelerating' | 'stopped'
```

Use `useState`. Expose `transitionTo(next: WheelState)` with guard against invalid transitions.

### 4.2 — Create `src/core/physics.ts`

```ts
interface PhysicsConfig {
  friction?: number;         // 0–1, default 0.995 (high = slow decay)
  deceleration?: number;     // Reanimated withDecay deceleration, default 0.998
  minVelocity?: number;      // stop threshold, default 0.1 deg/frame
}
```

```ts
velocityToAngularVelocity(panVelocity: number, radius: number): number
```
Converts gesture pan velocity (px/s) to angular velocity (deg/s).

### 4.3 — Create `src/hooks/useWheelAnimation.ts`

```ts
const {
  rotation,           // SharedValue<number>
  startSpin,          // (targetRotation, duration) => void
  startDecay,         // (initialVelocity) => void
  stopNow,            // () => void
  resetRotation,      // () => void
} = useWheelAnimation({ onSpinStart, onSpinEnd, onTick, physics })
```

Key implementation details:
- `rotation` is a `useSharedValue<number>(0)`
- `startSpin` uses `withTiming(targetRotation, { duration, easing: Easing.out(Easing.cubic) })`
- `startDecay` uses `withDecay({ velocity, deceleration })` from Reanimated
- All completion callbacks use `runOnJS` to call JS-thread handlers
- `onTick` / `onPointerCross` fired by tracking which segment the pointer overlaps — computed in a `useDerivedValue` watching `rotation`

For tick detection:
```ts
const currentSegmentIndex = useDerivedValue(() => {
  const normalized = ((rotation.value % 360) + 360) % 360;
  // find which segment angle range contains (360 - normalized + pointerAngle) % 360
  return computeCurrentSegmentIndex(normalized, segmentAngles);
});
```
Use `useAnimatedReaction` to call `runOnJS(onTick)` when segment index changes.

### 4.4 — Create `src/hooks/useWheelGesture.ts`

```ts
const { gesture } = useWheelGesture({ rotation, onGestureEnd, radius, physics })
```

- Use `Gesture.Pan()` from `react-native-gesture-handler`
- On `onUpdate`: calculate angular delta from touch position relative to center, add to `rotation`
- On `onEnd`: call `startDecay(angularVelocityFromGesture)`
- Guard against spinning state (disable gesture while controlled spin runs)

### 4.5 — Write tests: `src/__tests__/physics.test.ts`

- `velocityToAngularVelocity` — known input/output
- Tick detection logic — at known rotation values, correct segment fires

---

## Phase 5 — Shared Hooks Wiring [BLOCKER] (M)

**Goal:** `useWheel` master hook combining state, animation, gesture, and winner logic.

### 5.1 — Create `src/hooks/useWheel.ts`

```ts
const wheelProps = useWheel({
  data,
  weighted,
  controlledWinnerId,
  duration,
  removeWinnerOnSelect,
  onSpinStart,
  onSpinEnd,
  onTick,
  onPointerCross,
  physics,
  ref,             // forwarded ref
})
```

Returns:
- `rotation: SharedValue<number>`
- `segmentLayouts: SegmentLayout[]`
- `gesture: GestureType`
- `currentData: WheelItem[]`
- `state: WheelState`

Handles:
- Calling correct winner selection based on mode
- Calling `startSpin(targetRotation, duration)`
- Removing winner from `currentData` if `removeWinnerOnSelect`
- Wiring the ref handle (spin, spinTo, reset, stop, replaceData, getCurrentRotation)

### 5.2 — Create `src/hooks/useSegments.ts`

```ts
const segmentLayouts = useSegments(data, size)
```

`useMemo` wrapper around `buildSegmentLayouts`. Only recomputes when `data` or `size` changes.

---

## Phase 6 — SVG Renderer (L)

**Goal:** Fully working wheel using react-native-svg.

### 6.1 — Create `src/components/WheelSVG.tsx`

Props: `{ rotation, segmentLayouts, size, renderLabel, renderSlice, cx, cy, r }`

Structure:
```tsx
<GestureDetector gesture={gesture}>
  <Animated.View style={[styles.container, animatedStyle]}>
    <Svg width={size} height={size}>
      <G> {/* rotated group */}
        {segmentLayouts.map(seg => <SectorSlice key={seg.id} {...seg} />)}
      </G>
    </Svg>
  </Animated.View>
</GestureDetector>
```

The `animatedStyle` applies `transform: [{ rotate: `${rotation.value}deg` }]` via `useAnimatedStyle`.

### 6.2 — Create `src/components/WheelSVG/SectorSlice.tsx`

Renders a single SVG sector:
- `<Path d={layout.path} fill={layout.color} />`
- Optional `renderSlice` override
- Label via SVG `<Text>` or `<ForeignObject>` for multiline
- Image via `<Image>` from react-native-svg

### 6.3 — Label rendering in SVG

For normal text: `<SvgText x={labelPos.x} y={labelPos.y} rotation={labelPos.rotation} />`
For multiline: split on `\n`, render multiple `<TSpan>`.
For curved text: use `<TextPath>` along a circular arc `<Path>`.
For custom `renderLabel`: wrap in `<ForeignObject>`.

### 6.4 — Image rendering in SVG

```tsx
<SvgImage
  x={imgPos.x - imgPos.width / 2}
  y={imgPos.y - imgPos.height / 2}
  width={imgPos.width}
  height={imgPos.height}
  href={{ uri: item.imageUrl }}
  preserveAspectRatio="xMidYMid meet"
/>
```

Cache image URIs using the `image.ts` utility (Map<string, string>).

### 6.5 — Default Pointer & Center

`src/components/Pointer.tsx` — a simple triangle SVG positioned at 12 o'clock.
`src/components/CenterDot.tsx` — a circle overlaid in the center.

---

## Phase 7 — Skia Renderer (L)

**Goal:** Identical visual output as SVG renderer using `@shopify/react-native-skia`.

### 7.1 — Create `src/components/WheelSkia.tsx`

Same props interface as `WheelSVG`.

Use:
```tsx
import { Canvas, Path, Group, useSharedValueEffect } from '@shopify/react-native-skia'
```

Build Skia `Path` objects from the same `createSectorPath` SVG path strings using `Skia.Path.MakeFromSVGString(path)`.

Rotation: use Skia's `Group transform={[{ rotate: rotationRad }]}` — convert degrees to radians.
Connect Reanimated `SharedValue<number>` to Skia via `useSharedValueEffect` or Skia's `useDerivedValue`.

### 7.2 — Skia label rendering

Use Skia `<Text>` with `font` loaded via `useFont`.
For curved text: draw character-by-character along an arc path.

### 7.3 — Skia image rendering

Use `useImage(uri)` hook from Skia + `<Image>` Skia component.

### 7.4 — Guard optional import

Wrap all Skia imports in a try/catch or use dynamic require:
```ts
let SkiaWheelComponent: React.ComponentType<...> | null = null;
try {
  SkiaWheelComponent = require('./WheelSkia').WheelSkia;
} catch {}
```

Throw a clear error if `renderer="skia"` is requested but Skia is not installed.

---

## Phase 8 — Main Wheel Component (M)

**Goal:** Single `<Wheel>` entry point that routes to the correct renderer.

### 8.1 — Create `src/components/Wheel.tsx`

```tsx
const Wheel = React.forwardRef<WheelRef, WheelProps>((props, ref) => {
  const { renderer = 'svg', ...rest } = props;
  const wheelData = useWheel({ ...rest, ref });

  if (renderer === 'skia') return <WheelSkia {...wheelData} />;
  return <WheelSVG {...wheelData} />;
});
```

Wrap in `React.memo`.

### 8.2 — Accessibility wiring

On the outermost `View`:
```tsx
accessibilityRole="spinbutton"
accessibilityLabel={props.accessibilityLabel ?? 'Spin the wheel'}
accessibilityState={{ busy: state === 'spinning' }}
onAccessibilityActivate={() => ref.current?.spin()}
```

Announce winner via `AccessibilityInfo.announceForAccessibility(winner.label)` inside `onSpinEnd`.

---

## Phase 9 — Themes (S)

**Goal:** Light/dark/custom theme support with a default color palette.

### 9.1 — Create `src/themes/index.ts`

```ts
export interface ThemeConfig {
  palette: string[];      // default segment colors (min 8)
  background: string;
  text: string;
  border: string;
  pointer: string;
}

export const lightTheme: ThemeConfig = { ... }
export const darkTheme: ThemeConfig = { ... }

export function resolveTheme(theme: 'light' | 'dark' | ThemeConfig): ThemeConfig
```

Default palette: visually distinct, colorblind-friendly 8 colors.
Segments without an explicit `color` cycle through `theme.palette`.

---

## Phase 10 — Example App (M)

**Goal:** Working demo showing all features.

### 10.1 — Install deps in `example/`

Add Reanimated, SVG, Gesture Handler to `example/package.json`.
Configure Reanimated plugin in `example/babel.config.js`.

### 10.2 — Create `example/src/screens/`

- `BasicScreen.tsx` — random spin with 8 segments
- `WeightedScreen.tsx` — weighted wheel showing probability distribution
- `ControlledScreen.tsx` — input field to type a winner ID, spin lands exactly on it
- `ImageWheelScreen.tsx` — segments with `imageUrl`
- `CustomPointerScreen.tsx` — `renderPointer` prop with custom arrow
- `CustomCenterScreen.tsx` — `renderCenter` prop with logo

### 10.3 — Create `example/src/App.tsx`

Tab or list navigation between the six screens.
Show current winner label below the wheel in each screen.

---

## Phase 11 — Testing (L) [COMPLETED]

**Goal:** 90%+ coverage, all correctness properties verified.

### 11.1 — `src/__tests__/geometry.test.ts` (Phase 2.4 — expand here)

Additional cases:
- Full 360° arc handled without visual gap
- Inner radius = 0 (pie, not donut)
- Path string contains correct number of arc commands

### 11.2 — `src/__tests__/winner.test.ts` (Phase 3.2 — expand here)

- 100k iteration distribution test for weighted selection
- `calculateTargetRotation` property test: for any winner segment, applying the returned rotation brings that segment to the pointer

### 11.3 — `src/__tests__/segments.test.ts`

- 1 item → 360°
- 2 equal items → 180° each
- Disabled items included in layout but excluded from winner pool
- Weight normalization

### 11.4 — `src/__tests__/Wheel.test.tsx`

Using React Native Testing Library:
- Renders without crashing with minimal props
- `ref.spin()` triggers `onSpinStart` and eventually `onSpinEnd`
- `ref.spinTo(id)` calls `onSpinEnd` with correct winner
- `ref.reset()` returns rotation to 0
- `removeWinnerOnSelect` removes the winner from rendered segments after spin
- Controlled mode with invalid id throws/logs error gracefully

Mock Reanimated: use `jest-reanimated` or the official Reanimated mock.
Mock Gesture Handler: use official RNGH mock setup.

### 11.5 — `src/__tests__/physics.test.ts`

- Tick fires when segment boundary is crossed
- `onPointerCross` fires at segment boundaries
- Velocity to angular velocity conversion

---

## Phase 12 — CI/CD (S) [COMPLETED]

**Goal:** All GitHub Actions pass on every PR.

### 12.1 — Update `.github/workflows/ci.yml`

Current CI already has: lint, typecheck, test, build-library, build-android, build-ios.
Verify the test step runs with coverage: `yarn test --coverage`

### 12.2 — Add coverage enforcement

In `package.json` jest config:
```json
"coverageThreshold": {
  "global": { "lines": 90, "functions": 90, "branches": 85 }
}
```

---

## Phase 13 — Documentation (M) [COMPLETED]

**Goal:** Complete docs suite ready for npm publish.

### 13.1 — `README.md`

- Badges: npm version, CI status, license, coverage
- 30-second quick start (install + minimal usage)
- Feature list
- Platform support table
- All prop types with descriptions
- Three winner mode examples with code
- Ref API table
- Custom renderer examples (`renderPointer`, `renderLabel`)
- Performance notes

### 13.2 — `API.md`

Full API reference:
- `WheelItem` — every field, type, default, description
- `WheelProps` — every prop
- `WheelRef` — every method with parameter types
- `ThemeConfig`
- Geometry functions (for advanced consumers)

### 13.3 — `ARCHITECTURE.md`

- Renderer abstraction diagram (ASCII)
- State machine diagram (ASCII)
- Data flow: props → segments → geometry → renderer
- Physics model explanation
- Why Reanimated v4 (UI thread, worklets)
- Why react-native-svg as primary (widest support)

### 13.4 — `MIGRATION.md`

Guide for users migrating from:
- `react-native-wheel-of-fortune`
- `rn-wheel-pick`
- Any d3-based wheel

API comparison table: old prop → new prop.

### 13.5 — Update `CONTRIBUTING.md`

- Local dev setup with `yarn` workspaces
- Running the example app (iOS/Android/Web)
- Test commands
- Commit message format (conventional commits)

---

## Phase 14 — Storybook (M)

**Goal:** Visual stories for development and design review.

### 14.1 — Setup Storybook

Add `@storybook/react-native` to example devDependencies.
Configure in `example/.storybook/`.

### 14.2 — Create stories in `example/src/stories/`

- `BasicWheel.stories.tsx` — 8 equal segments, random spin
- `WeightedWheel.stories.tsx` — segments with varying weights, shows distribution
- `ControlledWheel.stories.tsx` — selector to pick winner, spin lands exactly
- `ImageWheel.stories.tsx` — segments with imageUrl
- `DarkMode.stories.tsx` — `theme="dark"` variant

---

## Phase 15 — Final Polish & Publish Readiness (S) [COMPLETED]

**Goal:** npm-publishable package.

### 15.1 — Run full build

```bash
yarn clean && yarn prepare
```

Verify:
- `lib/module/index.js` exists ✅
- `lib/typescript/src/index.d.ts` exports all public types ✅
- No build errors ✅

### 15.2 — Verify package.json metadata

- `name`: `react-native-wheel` ✅
- `version`: `0.1.0` ✅
- `main`, `types`, `exports` fields correct ✅
- `keywords`: react-native, wheel, spinner, fortune, spin ✅
- `files` array correct (no test files leaked) ✅

### 15.3 — Pre-publish checklist

- [x] `yarn lint` passes
- [x] `yarn typecheck` passes
- [x] `yarn test --coverage` passes (94.82% statements, 96.3% lines, 85.06% branches ≥ thresholds)
- [x] `yarn prepare` succeeds (20 files compiled, types generated)
- [ ] Example app runs on iOS and Android (manual verification required)
- [ ] All three winner modes verified manually in example app (manual verification required)
- [ ] README renders correctly on GitHub (verify after push)

---

## Dependency Order Summary

```
Phase 0 (Setup)
    ↓
Phase 1 (Types)          ← defines contracts
    ↓
Phase 2 (Geometry)       ← pure math, no React
    ↓
Phase 3 (Winner Logic)   ← pure logic, depends on geometry types
    ↓
Phase 4 (Animation)      ← Reanimated hooks, depends on types
    ↓
Phase 5 (useWheel)       ← combines all hooks
    ↓
Phase 6 (SVG Renderer)   ← first visual output
Phase 7 (Skia Renderer)  ← parallel with Phase 6 if desired
    ↓
Phase 8 (Wheel.tsx)      ← routes to renderer
    ↓
Phase 9 (Themes)         ← can be done anytime after Phase 1
Phase 10 (Example App)   ← requires Phase 8
Phase 11 (Tests)         ← can be written in parallel with implementation
Phase 12 (CI/CD)         ← verify after Phase 11
Phase 13 (Docs)          ← final
Phase 14 (Storybook)     ← after Phase 10
Phase 15 (Polish)        ← last
```

---

## Critical Correctness Properties

These must be verified by tests before marking the library complete:

1. **Controlled winner accuracy**: Given any `controlledWinnerId`, after the animation completes, `((rotation % 360) + 360) % 360` maps to exactly the winner's segment angle range. Off-by-one in pointer offset ruins this.

2. **Weighted distribution**: Over 10,000 spins, empirical frequency of each item matches its weight proportion within ±5%.

3. **Tick events**: `onTick` fires exactly once per segment boundary crossed. Fires N-1 times for N segments per full rotation. Never fires twice for the same boundary without crossing another.

4. **Gesture inertia**: After a flick, `withDecay` stops within a finite time. The stopped position is determined by `deceleration` physics, not truncated to the nearest segment (unless `snapToSegment` is added as a future option).

5. **State machine integrity**: `spin()` is a no-op while `state !== 'idle'`. `stop()` works from any state and transitions to `idle`.
