import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDerivedValue } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import type { PanGesture } from 'react-native-gesture-handler';
import {
  Canvas,
  Group,
  Path,
  Text as SkText,
  Image as SkImage,
  matchFont,
  useImage,
} from '@shopify/react-native-skia';
import type { SkFont, Transforms3d } from '@shopify/react-native-skia';

import type { ImagePosition, SegmentLayout, WheelItem } from '../types';
import { CenterDot } from './CenterDot';
import { Pointer } from './Pointer';

// ─── Image sub-component ──────────────────────────────────────────────────────
// Placed in a separate component so `useImage` is called unconditionally per
// image slot (hooks cannot be called inside a conditional or map callback).

interface SkiaSegmentImageProps {
  imageUrl: string;
  imagePosition: ImagePosition;
}

function SkiaSegmentImage({ imageUrl, imagePosition }: SkiaSegmentImageProps) {
  const image = useImage(imageUrl);
  if (!image) return null;
  return (
    <SkImage
      image={image}
      x={imagePosition.x - imagePosition.width / 2}
      y={imagePosition.y - imagePosition.height / 2}
      width={imagePosition.width}
      height={imagePosition.height}
      fit="contain"
    />
  );
}

// ─── Slice sub-component ──────────────────────────────────────────────────────

interface SkiaSectorSliceProps {
  layout: SegmentLayout;
  index: number;
  font: SkFont;
  renderSlice?: (item: WheelItem, index: number) => React.ReactNode;
}

const SkiaSectorSlice = React.memo(function SkiaSectorSliceComponent({
  layout,
  index,
  font,
  renderSlice,
}: SkiaSectorSliceProps) {
  const { path, color, labelPosition, imagePosition, item } = layout;

  if (renderSlice) {
    return <Group>{renderSlice(item, index)}</Group>;
  }

  const textWidth = font.measureText(item.label).width;
  const rotationRad = labelPosition.rotation * (Math.PI / 180);

  return (
    <Group>
      <Path path={path} color={color} />
      {item.imageUrl != null && (
        <SkiaSegmentImage
          imageUrl={item.imageUrl}
          imagePosition={imagePosition}
        />
      )}
      {/* Rotate label around its anchor point to face outward */}
      <Group
        transform={[{ rotate: rotationRad }]}
        origin={{ x: labelPosition.x, y: labelPosition.y }}
      >
        <SkText
          x={labelPosition.x - textWidth / 2}
          y={labelPosition.y + 5}
          text={item.label}
          font={font}
          color="white"
        />
      </Group>
    </Group>
  );
});

// ─── WheelSkia ────────────────────────────────────────────────────────────────

export interface WheelSkiaProps {
  rotation: SharedValue<number>;
  segmentLayouts: SegmentLayout[];
  gesture: PanGesture;
  size: number;
  cx: number;
  cy: number;
  renderPointer?: () => React.ReactNode;
  renderCenter?: () => React.ReactNode;
  /** Not used in the Skia renderer; Skia renders its own text. */
  renderLabel?: (item: WheelItem, index: number) => React.ReactNode;
  renderSlice?: (item: WheelItem, index: number) => React.ReactNode;
}

export const WheelSkia = React.memo(function WheelSkiaComponent({
  rotation,
  segmentLayouts,
  gesture,
  size,
  cx,
  cy,
  renderPointer,
  renderCenter,
  renderLabel: _renderLabel,
  renderSlice,
}: WheelSkiaProps) {
  // Derive Skia transform from Reanimated SharedValue — runs on the UI thread
  // so Skia can re-render without triggering React reconciliation.
  const transform = useDerivedValue<Transforms3d>(() => [
    { rotate: rotation.value * (Math.PI / 180) },
  ]);

  // matchFont returns a synchronous system font; memoised to avoid churn.
  const font = useMemo(
    () => matchFont({ fontSize: 14, fontWeight: 'bold' }),
    []
  );

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <GestureDetector gesture={gesture}>
        <Canvas style={StyleSheet.absoluteFill}>
          <Group transform={transform} origin={{ x: cx, y: cy }}>
            {segmentLayouts.map((seg, index) => (
              <SkiaSectorSlice
                key={seg.id}
                layout={seg}
                index={index}
                font={font}
                renderSlice={renderSlice}
              />
            ))}
          </Group>
        </Canvas>
      </GestureDetector>

      {/* Non-rotating overlays — identical to WheelSVG */}
      {renderPointer != null ? renderPointer() : <Pointer size={size} />}
      {renderCenter != null ? renderCenter() : <CenterDot cx={cx} cy={cy} />}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    overflow: 'visible',
  },
});
