import React, {
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { AccessibilityInfo, View } from 'react-native';

import type { WheelItem, WheelProps, WheelRef } from '../types';
import { resolveTheme } from '../themes';
import { useWheel } from '../hooks/useWheel';
import { WheelSVG } from './WheelSVG';
import type { WheelSVGProps } from './WheelSVG';
import type { WheelSkiaProps } from './WheelSkia';
import { Pointer } from './Pointer';
import { CenterDot } from './CenterDot';

const DEFAULT_SIZE = 320;

// Guard optional Skia dependency — succeeds when installed, stays null otherwise.
let SkiaComponent: React.ComponentType<WheelSkiaProps> | null = null;
try {
  SkiaComponent = (
    require('./WheelSkia') as { WheelSkia: React.ComponentType<WheelSkiaProps> }
  ).WheelSkia;
} catch {
  // @shopify/react-native-skia is not installed — SVG renderer remains default
}

export const Wheel = React.memo(
  React.forwardRef<WheelRef, WheelProps>(
    function WheelForwardRef(props, forwardedRef) {
      const {
        renderer = 'svg',
        size = DEFAULT_SIZE,
        disabled = false,
        accessibilityLabel,
        renderPointer,
        renderCenter,
        renderLabel,
        renderSlice,
        theme,
        onSpinEnd,
        ...wheelOptions
      } = props;

      const resolvedTheme = useMemo(
        () => resolveTheme(theme ?? 'light'),
        [theme]
      );

      // Announce winner for VoiceOver / TalkBack before calling consumer callback
      const handleSpinEnd = useCallback(
        (winner: WheelItem) => {
          AccessibilityInfo.announceForAccessibility(winner.label);
          onSpinEnd?.(winner);
        },
        [onSpinEnd]
      );

      // Internal ref is wired by useWheel's useImperativeHandle.
      // We proxy it to the consumer's forwarded ref so both can coexist.
      const internalRef = useRef<WheelRef>(null);

      const { rotation, segmentLayouts, gesture, state, cx, cy } = useWheel({
        ...wheelOptions,
        size,
        disabled,
        theme,
        onSpinEnd: handleSpinEnd,
        ref: internalRef,
      });

      useImperativeHandle(
        forwardedRef,
        () => ({
          spin: () => internalRef.current?.spin(),
          spinTo: (id: string) => internalRef.current?.spinTo(id),
          reset: () => internalRef.current?.reset(),
          stop: () => internalRef.current?.stop(),
          replaceData: (data: WheelItem[]) =>
            internalRef.current?.replaceData(data),
          getCurrentRotation: () =>
            internalRef.current?.getCurrentRotation() ?? 0,
        }),
        []
      );

      const handleAccessibilityActivate = useCallback(() => {
        internalRef.current?.spin();
      }, []);

      // Inject themed defaults when the consumer doesn't provide custom render slots.
      const effectiveRenderPointer = useCallback(
        () =>
          renderPointer != null ? (
            renderPointer()
          ) : (
            <Pointer size={size} color={resolvedTheme.pointer} />
          ),
        [renderPointer, size, resolvedTheme.pointer]
      );

      const effectiveRenderCenter = useCallback(
        () =>
          renderCenter != null ? (
            renderCenter()
          ) : (
            <CenterDot cx={cx} cy={cy} color={resolvedTheme.background} />
          ),
        [renderCenter, cx, cy, resolvedTheme.background]
      );

      const rendererProps: WheelSVGProps = useMemo(
        () => ({
          rotation,
          segmentLayouts,
          gesture,
          size,
          cx,
          cy,
          borderColor: resolvedTheme.border,
          renderPointer: effectiveRenderPointer,
          renderCenter: effectiveRenderCenter,
          renderLabel,
          renderSlice,
        }),
        [
          rotation,
          segmentLayouts,
          gesture,
          size,
          cx,
          cy,
          resolvedTheme.border,
          effectiveRenderPointer,
          effectiveRenderCenter,
          renderLabel,
          renderSlice,
        ]
      );

      const a11yProps = {
        accessible: true as const,
        accessibilityRole: 'spinbutton' as const,
        accessibilityLabel: accessibilityLabel ?? 'Spin the wheel',
        accessibilityState: { busy: state === 'spinning', disabled },
        onAccessibilityActivate: handleAccessibilityActivate,
      };

      if (renderer === 'skia') {
        if (SkiaComponent == null) {
          throw new Error(
            '[rn-wheel] renderer="skia" requires @shopify/react-native-skia to be installed.'
          );
        }
        return (
          <View {...a11yProps}>
            <SkiaComponent {...rendererProps} />
          </View>
        );
      }

      return (
        <View {...a11yProps}>
          <WheelSVG {...rendererProps} />
        </View>
      );
    }
  )
);
