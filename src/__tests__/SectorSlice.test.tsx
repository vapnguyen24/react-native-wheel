import { describe, it } from '@jest/globals';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { SectorSlice } from '../components/SectorSlice';
import type { SegmentLayout } from '../types';

describe('SectorSlice', () => {
  const layout: SegmentLayout = {
    id: '1',
    startAngle: 0,
    endAngle: 90,
    midAngle: 45,
    path: 'M 0 0',
    color: '#000',
    labelPosition: { x: 0, y: 0, rotation: 0 },
    imagePosition: { x: 0, y: 0, width: 10, height: 10 },
    item: { id: '1', label: 'Item' },
  };

  it('renders with default label', () => {
    render(<SectorSlice layout={layout} index={0} />);
  });

  it('renders with custom label', () => {
    render(
      <SectorSlice
        layout={layout}
        index={0}
        renderLabel={(item, _index) => <Text>{item.label}</Text>}
      />
    );
  });

  it('renders custom slice', () => {
    render(
      <SectorSlice
        layout={layout}
        index={0}
        renderSlice={(item, _index) => <Text>{item.label}</Text>}
      />
    );
  });

  it('renders with imageUrl', () => {
    const layoutWithImage = {
      ...layout,
      item: { ...layout.item, imageUrl: 'https://example.com/a.png' },
    };
    render(<SectorSlice layout={layoutWithImage} index={0} />);
  });
});
