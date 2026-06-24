import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

export interface PointerProps {
  size: number;
  color?: string;
}

// Canvas (scaled down ~73% from original 30×46)
const W = 22;
const H = 34;
const R = 11; // radius of the circular head
const CX = 11; // horizontal centre
const CY = 11; // circle centre Y (= R)

// Teardrop path — G1-continuous cubic beziers at both arc junctions.
const DROP = `M ${CX} ${H} C 2 29,0 19,0 ${CY} A ${R} ${R} 0 0 1 ${W} ${CY} C ${W} 19,20 29,${CX} ${H} Z`;

// Pixels the tip sits inside the wheel rim
const TIP_INSIDE = 6;

export const Pointer = React.memo(function PointerComponent({
  size,
  color = '#E8413E',
}: PointerProps) {
  return (
    <View style={[styles.wrapper, { width: size }]} pointerEvents="none">
      <Svg
        width={W}
        height={H}
        style={{ transform: [{ translateY: -(H - TIP_INSIDE) }] }}
      >
        {/* Drop shadow — offset duplicate */}
        <G transform="translate(1,3)">
          <Path d={DROP} fill="rgba(0,0,0,0.2)" />
        </G>

        {/* Main teardrop fill */}
        <Path d={DROP} fill={color} />

        {/* White stroke for contrast against dark segments */}
        <Path
          d={DROP}
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Concentric inner circles — depth cue inside the circular head */}
        <Circle cx={CX} cy={CY} r={7} fill="rgba(0,0,0,0.28)" />
        <Circle cx={CX} cy={CY} r={4} fill="rgba(0,0,0,0.22)" />

        {/* Small specular highlight */}
        <Circle cx={CX - 2} cy={CY - 3} r={2} fill="rgba(255,255,255,0.35)" />
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    position: 'absolute',
    top: 12,
    left: 0,
    zIndex: 10,
  },
});
