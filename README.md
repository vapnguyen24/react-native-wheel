# rn-wheel — React Native Wheel of Fortune Spinner

A high-performance, fully customizable **Wheel of Fortune / Spinning Wheel** component for React Native (iOS, Android, Web). Powered by `react-native-reanimated` for 60 fps UI-thread animations and `react-native-svg`, with optional `@shopify/react-native-skia` GPU rendering.

[![npm version](https://img.shields.io/npm/v/rn-wheel.svg)](https://www.npmjs.com/package/rn-wheel)
[![CI](https://github.com/vapnguyen24/react-native-wheel/actions/workflows/ci.yml/badge.svg)](https://github.com/vapnguyen24/react-native-wheel/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![coverage](https://img.shields.io/badge/coverage-90%25-brightgreen)](https://github.com/vapnguyen24/react-native-wheel/actions)

<video src="assets/short-demo.mp4" autoplay loop muted playsinline width="600"></video>

> Full demo: [assets/full-demo.mp4](assets/full-demo.mp4)

---

## Features

- 🎯 **Deterministic** — controlled mode guarantees exactly which segment the wheel lands on
- ⚡ **Performant** — 60 fps animations via Reanimated UI-thread worklets, zero JS-bridge overhead
- 🖼 **Multiple Renderers** — SVG (default, widest support) or Skia (GPU-accelerated)
- 🎨 **Highly Customizable** — themes, custom segment slices, images, pointers, labels, and center overlays
- ⚖️ **Flexible Winner Modes** — random, weighted probability, or exact controlled outcome
- ♿ **Accessible** — `accessibilityRole`, `accessibilityState`, and winner announcements via `AccessibilityInfo`
- 🌐 **Cross-platform** — iOS, Android, and Web

---

## Platform Support

| Platform | Supported | Notes |
|----------|-----------|-------|
| iOS      | ✅        | Fully supported |
| Android  | ✅        | Fully supported |
| Web      | ✅        | SVG renderer only |

---

## Installation

```sh
yarn add rn-wheel \
         react-native-reanimated \
         react-native-svg \
         react-native-gesture-handler
```

Follow the native setup guides for each peer dependency:
- [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/)
- [react-native-svg](https://github.com/software-mansion/react-native-svg?tab=readme-ov-file#installation)
- [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation)

**Optional — Skia renderer:**

```sh
yarn add @shopify/react-native-skia
```

---

## Quick Start

```tsx
import React, { useRef } from 'react';
import { View, Button } from 'react-native';
import { Wheel, type WheelRef } from 'rn-wheel';

const DATA = [
  { id: '1', label: '🎁 Grand Prize', color: '#E8413E' },
  { id: '2', label: '💰 Cash',        color: '#3E7BFA' },
  { id: '3', label: '🎟 Ticket',      color: '#44C97B' },
  { id: '4', label: '😢 Try Again',   color: '#F5A623' },
];

export default function App() {
  const wheelRef = useRef<WheelRef>(null);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Wheel
        ref={wheelRef}
        data={DATA}
        size={300}
        onSpinEnd={(winner) => console.log('Winner:', winner.label)}
      />
      <Button title="SPIN" onPress={() => wheelRef.current?.spin()} />
    </View>
  );
}
```

---

## Winner Modes

### 1. Random (default)

```tsx
<Wheel data={data} onSpinEnd={(w) => console.log(w.label)} />
// wheelRef.current.spin()
```

### 2. Weighted

```tsx
const data = [
  { id: '1', label: 'Rare',   color: '#red',   weight: 1 },
  { id: '2', label: 'Common', color: '#green', weight: 9 },
];

<Wheel data={data} weighted onSpinEnd={(w) => console.log(w.label)} />
```

`Common` will win approximately 90% of the time.

### 3. Controlled (guaranteed outcome)

```tsx
<Wheel
  data={data}
  controlledWinnerId="1"   // will always land on id '1'
  onSpinEnd={(w) => console.log(w.label)}
/>
```

---

## Ref API

Attach a `ref` to control the wheel imperatively:

```tsx
const wheelRef = useRef<WheelRef>(null);
<Wheel ref={wheelRef} data={data} />;
```

| Method | Signature | Description |
|--------|-----------|-------------|
| `spin` | `() => void` | Spin using the current winner mode |
| `spinTo` | `(id: string) => void` | Force spin to land on a specific item ID |
| `reset` | `() => void` | Instantly reset rotation to 0° |
| `stop` | `() => void` | Interrupt animation, decelerate to stop |
| `getCurrentRotation` | `() => number` | Current rotation in degrees |
| `replaceData` | `(data: WheelItem[]) => void` | Swap data without losing animation state |

---

## Custom Renderers

### Custom pointer

```tsx
<Wheel
  data={data}
  renderPointer={() => (
    <View style={styles.myArrow} />
  )}
/>
```

### Custom segment label

```tsx
<Wheel
  data={data}
  renderLabel={(item, position) => (
    <Text style={{ color: '#fff', fontWeight: 'bold' }}>
      {item.label}
    </Text>
  )}
/>
```

### Skia renderer

```tsx
<Wheel data={data} renderer="skia" />
```

---

## Performance Notes

- All rotation math runs on the **UI thread** via Reanimated worklets. The JS thread is never blocked during a spin.
- `segmentLayouts` are memoised — they are only recalculated when `data` or `size` changes.
- Images on segments are cached by URI to avoid repeated network requests.
- Use `React.memo` on any component you pass via `renderLabel` or `renderSlice` to avoid unnecessary re-renders.

---

## Documentation

| Document | Description |
|----------|-------------|
| [API.md](docs/API.md) | Full prop & method reference |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | How the library is structured internally |
| [MIGRATION.md](docs/MIGRATION.md) | Migrating from other wheel libraries |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Local dev setup and contribution guide |

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)

---

**Keywords:** react native wheel, react native spinner, wheel of fortune react native, rn-wheel, spinning wheel component, react native fortune wheel, reanimated wheel, react native prize wheel, react native random picker
