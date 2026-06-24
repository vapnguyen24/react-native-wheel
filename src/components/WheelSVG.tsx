import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import type { PanGesture } from 'react-native-gesture-handler';
import Svg, { G } from 'react-native-svg';

import type { SegmentLayout, WheelItem } from '../types';
import { CenterDot } from './CenterDot';
import { Pointer } from './Pointer';
import { SectorSlice } from './SectorSlice';

const BORDER_WIDTH = 8;

export interface WheelSVGProps {
  rotation: SharedValue<number>;
  segmentLayouts: SegmentLayout[];
  gesture: PanGesture;
  size: number;
  cx: number;
  cy: number;
  borderColor?: string;
  renderPointer?: () => React.ReactNode;
  renderCenter?: () => React.ReactNode;
  renderLabel?: (item: WheelItem, index: number) => React.ReactNode;
  renderSlice?: (item: WheelItem, index: number) => React.ReactNode;
}

export const WheelSVG = React.memo(function WheelSVGComponent({
  rotation,
  segmentLayouts,
  gesture,
  size,
  cx,
  cy,
  borderColor,
  renderPointer,
  renderCenter,
  renderLabel,
  renderSlice,
}: WheelSVGProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Rotating wheel — GestureDetector intercepts drags/flicks */}
      <GestureDetector gesture={gesture}>
        <Animated.View style={[{ width: size, height: size }, animatedStyle]}>
          <Svg width={size} height={size}>
            <G>
              {segmentLayouts.map((seg, index) => (
                <SectorSlice
                  key={seg.id}
                  layout={seg}
                  index={index}
                  renderLabel={renderLabel}
                  renderSlice={renderSlice}
                />
              ))}
            </G>
          </Svg>
        </Animated.View>
      </GestureDetector>

      {/* Non-rotating overlays */}
      {renderPointer != null ? renderPointer() : <Pointer size={size} />}
      {renderCenter != null ? renderCenter() : <CenterDot cx={cx} cy={cy} />}

      {/* Outer border ring — sits on top, does not rotate */}
      {borderColor != null && (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            styles.ring,
            { borderColor, borderRadius: size / 2 },
          ]}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    overflow: 'visible',
  },
  ring: {
    borderWidth: BORDER_WIDTH,
  },
});
