import React from 'react';
import {
  ForeignObject,
  G,
  Image as SvgImage,
  Path,
  Text as SvgText,
} from 'react-native-svg';

import type { SegmentLayout, WheelItem } from '../types';
import { getCachedImageUri } from '../utils/image';

export interface SectorSliceProps {
  layout: SegmentLayout;
  index: number;
  renderLabel?: (item: WheelItem, index: number) => React.ReactNode;
  renderSlice?: (item: WheelItem, index: number) => React.ReactNode;
}

const LABEL_FO_WIDTH = 80;
const LABEL_FO_HEIGHT = 30;

export const SectorSlice = React.memo(function SectorSlice({
  layout,
  index,
  renderLabel,
  renderSlice,
}: SectorSliceProps) {
  const { path, color, labelPosition, imagePosition, item } = layout;

  // Custom renderSlice: caller provides full SVG content for this sector
  if (renderSlice) {
    return <G>{renderSlice(item, index)}</G>;
  }

  return (
    <G>
      <Path d={path} fill={color} />

      {item.imageUrl && (
        <SvgImage
          x={imagePosition.x - imagePosition.width / 2}
          y={imagePosition.y - imagePosition.height / 2}
          width={imagePosition.width}
          height={imagePosition.height}
          href={{ uri: getCachedImageUri(item.imageUrl) }}
          preserveAspectRatio="xMidYMid meet"
        />
      )}

      {renderLabel ? (
        <ForeignObject
          x={labelPosition.x - LABEL_FO_WIDTH / 2}
          y={labelPosition.y - LABEL_FO_HEIGHT / 2}
          width={LABEL_FO_WIDTH}
          height={LABEL_FO_HEIGHT}
        >
          {renderLabel(item, index)}
        </ForeignObject>
      ) : (
        <SvgText
          x={labelPosition.x}
          y={labelPosition.y}
          fill="white"
          fontSize={14}
          fontWeight="bold"
          textAnchor="middle"
          alignmentBaseline="middle"
          transform={`rotate(${labelPosition.rotation}, ${labelPosition.x}, ${labelPosition.y})`}
        >
          {item.label}
        </SvgText>
      )}
    </G>
  );
});
