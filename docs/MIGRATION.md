# Migration Guide

Migrating to `react-native-wheel` from other popular wheel libraries? Here is what you need to know.

---

## From `react-native-wheel-of-fortune`

### Installation changes

```diff
- yarn add react-native-wheel-of-fortune
+ yarn add react-native-wheel react-native-reanimated react-native-svg react-native-gesture-handler
```

### API comparison

| Old prop (`rn-wheel-of-fortune`) | New prop (`react-native-wheel`) | Notes |
|---|---|---|
| `options` | `data` | Now accepts `WheelItem[]` with explicit `id` fields |
| `winner` | `controlledWinnerId` | Pass the item `id`, not the index |
| `duration` | `duration` | Same — milliseconds |
| `colors` | `theme.palette` or per-item `color` | Set globally via `theme` or per segment via `item.color` |
| `textColors` | `theme.text` | |
| `fontSize` | `renderLabel` | Use the custom renderer prop for full text control |
| `onPress` | Removed — use `ref.current.spin()` | |
| `backgroundColor` | `theme.background` | |
| `borderColor` | `theme.border` | |
| `getWinner` (callback) | `onSpinEnd(winner: WheelItem)` | Receives the full `WheelItem` object, not just a string |

### Code example

```diff
- <WheelOfFortune
-   options={['Apple', 'Banana', 'Cherry']}
-   colors={['#ff0000', '#00ff00', '#0000ff']}
-   winner={1}
-   getWinner={(value, index) => console.log(value)}
- />
+ <Wheel
+   data={[
+     { id: '1', label: 'Apple',  color: '#ff0000' },
+     { id: '2', label: 'Banana', color: '#00ff00' },
+     { id: '3', label: 'Cherry', color: '#0000ff' },
+   ]}
+   controlledWinnerId="2"
+   onSpinEnd={(winner) => console.log(winner.label)}
+ />
```

---

## From `rn-wheel-pick`

### Installation changes

```diff
- yarn add rn-wheel-pick
+ yarn add react-native-wheel react-native-reanimated react-native-svg react-native-gesture-handler
```

### API comparison

| Old prop (`rn-wheel-pick`) | New prop (`react-native-wheel`) | Notes |
|---|---|---|
| `selectedIndex` | `controlledWinnerId` | Now uses a string `id` instead of a numeric index |
| `data` (string[]) | `data` (WheelItem[]) | Must map strings to `{ id, label }` objects |
| `style` | `size` | Pass the diameter in pixels |
| `onChange` | `onSpinEnd` | Fires with the full `WheelItem` |

### Code example

```diff
- <WheelPick
-   data={['Option A', 'Option B', 'Option C']}
-   selectedIndex={2}
-   onChange={(data) => console.log(data.label)}
- />
+ <Wheel
+   data={[
+     { id: '0', label: 'Option A' },
+     { id: '1', label: 'Option B' },
+     { id: '2', label: 'Option C' },
+   ]}
+   controlledWinnerId="2"
+   onSpinEnd={(winner) => console.log(winner.label)}
+ />
```

---

## From D3-based wheels (react-native-d3-wheel, custom SVG)

If you built your own wheel using D3 or raw SVG paths, you can reuse your path math and plug straight in via `renderSlice`:

```tsx
<Wheel
  data={myData}
  renderSlice={(item, pathString) => (
    <MyCustomD3Slice item={item} path={pathString} />
  )}
/>
```

The `pathString` passed to `renderSlice` is already the correct SVG `d` attribute value computed by `react-native-wheel`'s geometry engine, so no recalculation is needed.

---

## Notes on Peer Dependencies

`react-native-wheel` deliberately does **not** bundle Reanimated or SVG — they are peer dependencies. This avoids version conflicts and keeps your app's bundle free of duplicated animation runtimes.

Make sure the peer versions you install are compatible:

| Peer | Minimum version |
|------|----------------|
| `react-native-reanimated` | `>= 4.0.0` |
| `react-native-svg` | `>= 15.0.0` |
| `react-native-gesture-handler` | `>= 3.0.0` |
| `@shopify/react-native-skia` | `>= 2.0.0` (optional) |
