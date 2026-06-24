import { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Wheel } from 'react-native-wheel';
import type { WheelItem, WheelRef } from 'react-native-wheel';

const DATA: WheelItem[] = [
  { id: '1', label: 'Rock', color: '#E8413E' },
  { id: '2', label: 'Paper', color: '#3E7BFA' },
  { id: '3', label: 'Scissors', color: '#4BB543' },
  { id: '4', label: 'Lizard', color: '#F4A228' },
  { id: '5', label: 'Spock', color: '#7C4DFF' },
];

const WHEEL_SIZE = 300;
const CENTER = WHEEL_SIZE / 2;
const BUTTON_SIZE = 64;

export function CustomCenterScreen() {
  const wheelRef = useRef<WheelRef>(null);
  const [winner, setWinner] = useState<string | null>(null);

  // renderCenter replaces the default CenterDot with a tappable SPIN button.
  // wheelRef is stable across renders so capturing it in [] deps is safe.
  const renderCenter = useCallback(
    () => (
      <TouchableOpacity
        onPress={() => wheelRef.current?.spin()}
        style={[
          styles.centerButton,
          {
            top: CENTER - BUTTON_SIZE / 2,
            left: CENTER - BUTTON_SIZE / 2,
          },
        ]}
        activeOpacity={0.8}
      >
        <Text style={styles.centerText}>SPIN</Text>
      </TouchableOpacity>
    ),
    []
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Custom Center</Text>
      <Text style={styles.subtitle}>Tap the center button to spin</Text>
      <Wheel
        ref={wheelRef}
        data={DATA}
        size={WHEEL_SIZE}
        renderCenter={renderCenter}
        onSpinEnd={(item) => setWinner(item.label)}
      />
      <View style={styles.resultArea}>
        {winner != null && <Text style={styles.winner}>{winner}</Text>}
      </View>
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
  centerButton: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: '#FF4081',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  centerText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1,
  },
  resultArea: {
    height: 32,
    justifyContent: 'center',
  },
  winner: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FF4081',
  },
});
