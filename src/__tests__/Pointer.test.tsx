import { describe, it } from '@jest/globals';
import { render } from '@testing-library/react-native';
import { Pointer } from '../components/Pointer';

describe('Pointer', () => {
  it('renders with default color', () => {
    render(<Pointer size={100} />);
  });

  it('renders with custom color', () => {
    render(<Pointer size={100} color="#000000" />);
  });
});
