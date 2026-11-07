import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MathBackground } from '../components/MathBackground';

describe('MathBackground', () => {
  it('renders without crashing', () => {
    const { container } = render(<MathBackground />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('is marked as decorative for accessibility', () => {
    const { container } = render(<MathBackground />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveAttribute('aria-hidden', 'true');
  });
});