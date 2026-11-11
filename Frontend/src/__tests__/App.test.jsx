import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

beforeAll(() => {
  Object.defineProperty(global.navigator, 'geolocation', {
    value: { getCurrentPosition: vi.fn() },
    writable: true
  });
  // Force English for i18n tests
  Object.defineProperty(global.navigator, 'language', {
    value: 'en-US',
    configurable: true
  });
  localStorage.clear();
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