import { useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Wheel } from '@vap/react-native-wheel';
import type { WheelItem, WheelRef } from '@vap/react-native-wheel';

const DATA: WheelItem[] = [
  { id: 'alpha', label: 'Alpha', color: '#E8413E' },
  { id: 'beta', label: 'Beta', color: '#F4A228' },
  { id: 'gamma', label: 'Gamma', color: '#F7D13E' },
  { id: 'delta', label: 'Delta', color: '#4BB543' },
  { id: 'epsilon', label: 'Epsilon', color: '#3E7BFA' },
  { id: 'zeta', label: 'Zeta', color: '#7C4DFF' },
];

export function ControlledScreen() {
  const wheelRef = useRef<WheelRef>(null);
  const [winner, setWinner] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Controlled Spin</Text>
      <Text style={styles.subtitle}>Tap a segment to force that outcome</Text>
      <Wheel
        ref={wheelRef}
        data={DATA}
        size={280}
        onSpinEnd={(item) => setWinner(item.label)}
      />
      <View style={styles.grid}>
        {DATA.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.itemButton, { backgroundColor: item.color }]}
            onPress={() => wheelRef.current?.spinTo(item.id)}
          >
            <Text style={styles.itemButtonText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.resultArea}>
        {winner != null && (
          <Text style={styles.winner}>Landed on: {winner}</Text>
        )}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    maxWidth: 320,
  },
  itemButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  itemButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  resultArea: {
    height: 28,
    justifyContent: 'center',
  },
  winner: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
});
