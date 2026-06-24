import { describe, it } from '@jest/globals';
import { render } from '@testing-library/react-native';
import { WheelSkia } from '../components/WheelSkia';

describe('WheelSkia', () => {
  const layout: any[] = [
    {
      id: '1',
      path: 'M 0 0',
      color: '#000',
      labelPosition: { x: 0, y: 0, rotation: 0 },
      imagePosition: { x: 0, y: 0, width: 10, height: 10 },
      item: { id: '1', label: 'Item', imageUrl: 'https://example.com/a.png' },
    },
  ];

  it('renders with custom renderers', () => {
    render(
      <WheelSkia
        rotation={{ value: 0 } as any}
        segmentLayouts={layout}
        gesture={{} as any}
        size={300}
        cx={150}
        cy={150}
        renderLabel={() => null}
      />
    );
  });

  it('renders with renderSlice', () => {
    render(
      <WheelSkia
        rotation={{ value: 0 } as any}
        segmentLayouts={layout}
        gesture={{} as any}
        size={300}
        cx={150}
        cy={150}
        renderSlice={() => null}
      />
    );
  });
});
