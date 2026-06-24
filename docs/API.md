# API Reference

## `WheelProps`

The main properties accepted by the `<Wheel />` component.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `WheelItem[]` | Required | Array of items to be displayed on the wheel. |
| `renderer` | `'svg' \| 'skia'` | `'svg'` | Which rendering engine to use. |
| `size` | `number` | `300` | Diameter of the wheel in pixels. |
| `duration` | `number` | `3000` | Base spin animation duration in milliseconds. |
| `weighted` | `boolean` | `false` | If true, items are selected proportionally based on their `weight` property. |
| `controlledWinnerId` | `string` | `undefined` | ID of the item that must win. Bypasses random selection entirely. |
| `removeWinnerOnSelect`| `boolean` | `false` | If true, automatically removes the winning item from the wheel after spin. |
| `theme` | `'light' \| 'dark' \| ThemeConfig` | `'light'` | Defines the visual appearance (colors, text color, borders). |
| `accessibilityLabel` | `string` | `'Spin the wheel'`| Accessibility label for the spin button. |

**Callbacks:**
- `onSpinStart?: () => void`
- `onSpinEnd?: (winner: WheelItem) => void`
- `onTick?: () => void` - Fired every time the wheel pointer crosses a segment boundary.
- `onPointerCross?: (item: WheelItem) => void` - Fired with the item under the pointer.

**Custom Renderers:**
- `renderPointer?: () => React.ReactNode`
- `renderCenter?: () => React.ReactNode`
- `renderLabel?: (item: WheelItem, position: Position) => React.ReactNode`
- `renderSlice?: (item: WheelItem, path: string) => React.ReactNode`

---

## `WheelItem`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | `string` | Required | Unique identifier for the item. |
| `label` | `string` | Required | Text displayed on the segment. |
| `color` | `string` | optional | Custom background color for this segment. |
| `weight` | `number` | `1` | Affects probability when `weighted=true`. |
| `imageUrl` | `string` | optional | URL to display an image on the segment. |
| `disabled` | `boolean` | `false` | If true, the item is rendered but will never be selected as a winner. |
| `metadata` | `Record<string, any>`| optional | Attach any custom user data here. |

---

## `WheelRef`

You can attach a React `ref` to `<Wheel ref={myRef} />` to control the component imperatively.

| Method | Description |
|--------|-------------|
| `spin()` | Starts a standard random spin (or weighted if `weighted` is true, or uses `controlledWinnerId` if provided). |
| `spinTo(id: string)` | Forces the wheel to spin and land exactly on the segment with the given `id`. |
| `reset()` | Instantly resets the rotation back to 0 degrees. |
| `stop()` | Interrupts the animation and decelerates to a stop. |
| `getCurrentRotation()` | Returns the current rotation angle. |
| `replaceData(newData: WheelItem[])` | Safely updates the underlying data while preserving animation states. |

---

## `ThemeConfig`

If you pass a custom object to `theme`, you must satisfy this interface:

```ts
export interface ThemeConfig {
  palette: string[];      // Array of hex colors for segments without explicit 'color'
  background: string;     // Fallback background
  text: string;           // Default label text color
  border: string;         // Segment border line color
  pointer: string;        // Default pointer arrow color
}
```

---

## Geometry Functions (Advanced)

Import from `react-native-wheel/geometry` to build your own renderers:

- `calculateSegmentAngles(items: WheelItem[]): SegmentAngle[]`
- `buildSegmentLayouts(items: WheelItem[], angles: SegmentAngle[], cx: number, cy: number, r: number): SegmentLayout[]`
- `createSectorPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string`
- `polarToCartesian(cx: number, cy: number, r: number, angleDeg: number): { x: number; y: number }`
