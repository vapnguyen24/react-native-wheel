import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';

import { CenterDot } from '../components/CenterDot';

describe('CenterDot', () => {
  it('renders without crashing', async () => {
    await expect(
      render(<CenterDot cx={100} cy={100} />)
    ).resolves.toBeDefined();
  });

  it('is positioned centred on (cx, cy)', async () => {
    const { toJSON } = await render(<CenterDot cx={80} cy={60} dotSize={20} />);
    const view = toJSON() as unknown as { props: { style: object[] } };
    // top = cy - half = 60 - 10 = 50, left = cx - half = 80 - 10 = 70
    const styleStr = JSON.stringify(view.props.style);
    expect(styleStr).toContain('"top":50');
    expect(styleStr).toContain('"left":70');
  });

  it('uses the default dotSize when not specified', async () => {
    await expect(render(<CenterDot cx={0} cy={0} />)).resolves.toBeDefined();
  });

  it('accepts a custom colour', async () => {
    const { toJSON } = await render(
      <CenterDot cx={50} cy={50} color="#FF0000" />
    );
    const view = toJSON() as unknown as { props: { style: object[] } };
    const styleStr = JSON.stringify(view.props.style);
    expect(styleStr).toContain('#FF0000');
  });

  it('has pointerEvents="none" so it does not block touch', async () => {
    const { toJSON } = await render(<CenterDot cx={0} cy={0} />);
    const view = toJSON() as unknown as { props: Record<string, unknown> };
    expect(view.props.pointerEvents).toBe('none');
  });

  it('applies borderRadius equal to half the dotSize', async () => {
    const dotSize = 40;
    const { toJSON } = await render(
      <CenterDot cx={0} cy={0} dotSize={dotSize} />
    );
    const view = toJSON() as unknown as { props: { style: object[] } };
    const styleStr = JSON.stringify(view.props.style);
    expect(styleStr).toContain(`"borderRadius":${dotSize / 2}`);
  });

  it('applies width and height equal to dotSize', async () => {
    const dotSize = 30;
    const { toJSON } = await render(
      <CenterDot cx={0} cy={0} dotSize={dotSize} />
    );
    const view = toJSON() as unknown as { props: { style: object[] } };
    const styleStr = JSON.stringify(view.props.style);
    expect(styleStr).toContain(`"width":${dotSize}`);
    expect(styleStr).toContain(`"height":${dotSize}`);
  });
});
