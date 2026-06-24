import React from 'react';
import { StyleSheet, View } from 'react-native';

export interface CenterDotProps {
  cx: number;
  cy: number;
  color?: string;
  dotSize?: number;
}

const DEFAULT_DOT_SIZE = 20;

export const CenterDot = React.memo(function CenterDot({
  cx,
  cy,
  color = '#FFFFFF',
  dotSize = DEFAULT_DOT_SIZE,
}: CenterDotProps) {
  const half = dotSize / 2;
  return (
    <View
      pointerEvents="none"
      style={[
        styles.dot,
        {
          width: dotSize,
          height: dotSize,
          borderRadius: half,
          backgroundColor: color,
          top: cy - half,
          left: cx - half,
        },
      ]}
    />
  );
});

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
});
