import { useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Wheel } from 'rn-wheel';
import type { WheelItem, WheelRef } from 'rn-wheel';

const DATA: WheelItem[] = [
  { id: '1', label: 'Rock', color: '#E8413E' },
  { id: '2', label: 'Paper', color: '#3E7BFA' },
  { id: '3', label: 'Scissors', color: '#4BB543' },
  { id: '4', label: 'Lizard', color: '#F4A228' },
  { id: '5', label: 'Spock', color: '#7C4DFF' },
  { id: '6', label: 'Rock', color: '#E8413E' },
  { id: '7', label: 'Paper', color: '#3E7BFA' },
  { id: '8', label: 'Scissors', color: '#4BB543' },
  { id: '9', label: 'Lizard', color: '#F4A228' },
  { id: '10', label: 'Spock', color: '#7C4DFF' },
];

const WHEEL_SIZE = 300;
const CENTER = WHEEL_SIZE / 2;
const BUTTON_SIZE = 64;

export function CustomCenterScreen() {
  const wheelRef = useRef<WheelRef>(null);
  const [winner, setWinner] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Custom Center</Text>
      <Text style={styles.subtitle}>Tap the center button to spin</Text>

      {/*
        The SPIN button is a sibling of <Wheel> inside the wrapper View,
        NOT passed via renderCenter. On Android, the Skia Canvas can interfere
        with React Native Views rendered inside its component tree. Positioning
        the overlay OUTSIDE the Wheel component avoids that issue entirely.
      */}
      <View style={styles.wheelWrapper}>
        <Wheel
          ref={wheelRef}
          data={DATA}
          size={WHEEL_SIZE}
          renderer="skia"
          onSpinEnd={(item) => setWinner(item.label)}
        />
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
      </View>

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
  wheelWrapper: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
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
    fontWeight: 'bold',
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
