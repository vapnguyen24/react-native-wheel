import { useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Wheel } from 'rn-wheel';
import type { WheelItem, WheelRef } from 'rn-wheel';

const DATA: WheelItem[] = [
  { id: '1', label: 'Pizza', color: '#E8413E' },
  { id: '2', label: 'Tacos', color: '#F4A228' },
  { id: '3', label: 'Sushi', color: '#F7D13E' },
  { id: '4', label: 'Burger', color: '#4BB543' },
  { id: '5', label: 'Pasta', color: '#3E7BFA' },
  { id: '6', label: 'Salad', color: '#7C4DFF' },
  { id: '7', label: 'Ramen', color: '#FF4081' },
  { id: '8', label: 'Steak', color: '#00BCD4' },
];

export function BasicScreen() {
  const wheelRef = useRef<WheelRef>(null);
  const [winner, setWinner] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What to eat tonight?</Text>
      <Wheel
        ref={wheelRef}
        data={DATA}
        size={300}
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
  resultArea: {
    height: 32,
    justifyContent: 'center',
  },
  winner: {
    fontSize: 22,
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
