import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

// Mock geolocation
beforeAll(() => {
  Object.defineProperty(global.navigator, 'geolocation', {
    value: { getCurrentPosition: vi.fn() },
    writable: true
  });
});

describe('App', () => {
  it('renders the DinoBox brand', () => {
    render(<App />);
    expect(screen.getByText(/DinoBox/i)).toBeInTheDocument();
  });

  it('shows sign-in link when not authenticated', () => {
    render(<App />);
    expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
  });

  it('renders main navigation links', () => {
    render(<App />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
  });
});