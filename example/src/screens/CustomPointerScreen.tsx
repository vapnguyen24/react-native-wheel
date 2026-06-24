import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Wheel } from 'react-native-wheel';
import type { WheelItem, WheelRef } from 'react-native-wheel';

const DATA: WheelItem[] = [
  { id: '1', label: 'Red', color: '#E8413E' },
  { id: '2', label: 'Orange', color: '#F4A228' },
  { id: '3', label: 'Yellow', color: '#F7D13E' },
  { id: '4', label: 'Green', color: '#4BB543' },
  { id: '5', label: 'Blue', color: '#3E7BFA' },
  { id: '6', label: 'Purple', color: '#7C4DFF' },
];

const WHEEL_SIZE = 300;

// Pin-shaped pointer: circle on top, downward triangle below.
const CustomPointer = React.memo(function CustomPointerComponent() {
  return (
    <View
      style={[styles.pointerWrapper, { width: WHEEL_SIZE }]}
      pointerEvents="none"
    >
      <View style={styles.pinGroup}>
        <View style={styles.pinHead} />
        <View style={styles.pinTip} />
      </View>
    </View>
  );
});

export function CustomPointerScreen() {
  const wheelRef = useRef<WheelRef>(null);
  const [winner, setWinner] = useState<string | null>(null);

  const renderPointer = useCallback(() => <CustomPointer />, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Custom Pointer</Text>
      <Text style={styles.subtitle}>Pin-shaped pointer via renderPointer</Text>
      <Wheel
        ref={wheelRef}
        data={DATA}
        size={WHEEL_SIZE}
        renderPointer={renderPointer}
        onSpinEnd={(item) => setWinner(item.label)}
      />
      <View style={styles.resultArea}>
        {winner != null && <Text style={styles.winner}>{winner}</Text>}
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => wheelRef.current?.spin()}
      >
        <Text style={styles.buttonText}>Spin</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 24,
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: -8,
  },
  pointerWrapper: {
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  // Translate the whole group up so the triangle tip sits just inside the wheel rim.
  pinGroup: {
    alignItems: 'center',
    transform: [{ translateY: -30 }],
  },
  pinHead: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#7C4DFF',
  },
  pinTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#7C4DFF',
    marginTop: -2,
  },
  resultArea: {
    height: 32,
    justifyContent: 'center',
  },
  winner: {
    fontSize: 22,
    fontWeight: '700',
    color: '#7C4DFF',
  },
  button: {
    backgroundColor: '#7C4DFF',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
