import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { BasicScreen } from './screens/BasicScreen';
import { WeightedScreen } from './screens/WeightedScreen';
import { ControlledScreen } from './screens/ControlledScreen';
import { ImageWheelScreen } from './screens/ImageWheelScreen';
import { CustomPointerScreen } from './screens/CustomPointerScreen';
import { CustomCenterScreen } from './screens/CustomCenterScreen';

type ScreenKey =
  | 'basic'
  | 'weighted'
  | 'controlled'
  | 'images'
  | 'pointer'
  | 'center';

const SCREENS: Array<{
  key: ScreenKey;
  label: string;
  component: React.ComponentType;
}> = [
  { key: 'basic', label: 'Basic', component: BasicScreen },
  { key: 'weighted', label: 'Weighted', component: WeightedScreen },
  { key: 'controlled', label: 'Controlled', component: ControlledScreen },
  { key: 'images', label: 'Images', component: ImageWheelScreen },
  { key: 'pointer', label: 'Custom Pointer', component: CustomPointerScreen },
  { key: 'center', label: 'Custom Center', component: CustomCenterScreen },
];

export default function App() {
  const [active, setActive] = useState<ScreenKey>('basic');
  const ActiveScreen =
    SCREENS.find((s) => s.key === active)?.component ?? BasicScreen;

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.root}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabBar}
          contentContainerStyle={styles.tabContent}
        >
          {SCREENS.map((s) => (
            <TouchableOpacity
              key={s.key}
              onPress={() => setActive(s.key)}
              style={[styles.tab, active === s.key && styles.tabActive]}
            >
              <Text
                style={[
                  styles.tabLabel,
                  active === s.key && styles.tabLabelActive,
                ]}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ActiveScreen />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 24 },
  tabBar: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    maxHeight: 48,
  },
  tabContent: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 2,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#3E7BFA',
  },
  tabLabel: {
    fontSize: 14,
    color: '#888',
  },
  tabLabelActive: {
    color: '#3E7BFA',
    fontWeight: '600',
  },
});
