import { useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Wheel } from '@vapng/react-native-wheel';
import type { WheelItem, WheelRef } from '@vapng/react-native-wheel';

const DATA: WheelItem[] = [
  { id: '1', label: 'Grand Prize', weight: 1, color: '#E8413E' },
  { id: '2', label: '2nd Prize', weight: 2, color: '#F4A228' },
  { id: '3', label: '3rd Prize', weight: 3, color: '#4BB543' },
  { id: '4', label: 'Try Again', weight: 5, color: '#3E7BFA' },
];

const TOTAL_WEIGHT = DATA.reduce((sum, item) => sum + (item.weight ?? 1), 0);

function pct(weight: number) {
  return ((weight / TOTAL_WEIGHT) * 100).toFixed(0);
}

export function WeightedScreen() {
  const wheelRef = useRef<WheelRef>(null);
  const [winner, setWinner] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weighted Spin</Text>
      <Wheel
        ref={wheelRef}
        data={DATA}
        size={300}
        weighted
        onSpinEnd={(item) => setWinner(item.label)}
      />
      <View style={styles.legend}>
        {DATA.map((item) => (
          <View key={item.id} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={styles.legendLabel}>{item.label}</Text>
            <Text style={styles.legendPct}>{pct(item.weight ?? 1)}%</Text>
          </View>
        ))}
      </View>
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
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  legend: {
    gap: 4,
    width: 240,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    flex: 1,
    fontSize: 13,
    color: '#444',
  },
  legendPct: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
    width: 36,
    textAlign: 'right',
  },
  resultArea: {
    height: 28,
    justifyContent: 'center',
  },
  winner: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E8413E',
  },
  button: {
    backgroundColor: '#3E7BFA',
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
