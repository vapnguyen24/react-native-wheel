import React from 'react';
import { StyleSheet, View } from 'react-native';

export interface PointerProps {
  size: number;
  color?: string;
}

const POINTER_WIDTH = 16;
const POINTER_HEIGHT = 22;

export const Pointer = React.memo(function Pointer({
  size,
  color = '#E8413E',
}: PointerProps) {
  return (
    <View style={[styles.wrapper, { width: size }]} pointerEvents="none">
      <View
        style={[
          styles.triangle,
          {
            borderTopColor: color,
            // Shift so the tip sits ~5px inside the wheel top edge
            transform: [{ translateY: -(POINTER_HEIGHT * 0.75) }],
          },
        ]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: POINTER_WIDTH / 2,
    borderRightWidth: POINTER_WIDTH / 2,
    borderTopWidth: POINTER_HEIGHT,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#E8413E',
  },
});
