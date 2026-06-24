import { useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Wheel } from 'rn-wheel';
import type { WheelItem, WheelRef } from 'rn-wheel';

const DATA: WheelItem[] = [
  {
    id: '1',
    label: 'Mountains',
    color: '#4BB543',
    imageUrl: 'https://picsum.photos/seed/mtn/100/100',
  },
  {
    id: '2',
    label: 'Ocean',
    color: '#3E7BFA',
    imageUrl: 'https://picsum.photos/seed/ocean/100/100',
  },
  {
    id: '3',
    label: 'Forest',
    color: '#00BCD4',
    imageUrl: 'https://picsum.photos/seed/forest/100/100',
  },
  {
    id: '4',
    label: 'Desert',
    color: '#F4A228',
    imageUrl: 'https://picsum.photos/seed/desert/100/100',
  },
  {
    id: '5',
    label: 'City',
    color: '#7C4DFF',
    imageUrl: 'https://picsum.photos/seed/city99/100/100',
  },
  {
    id: '6',
    label: 'Farm',
    color: '#FF4081',
    imageUrl: 'https://picsum.photos/seed/farm42/100/100',
  },
];

export function ImageWheelScreen() {
  const wheelRef = useRef<WheelRef>(null);
  const [winner, setWinner] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Image Wheel</Text>
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
