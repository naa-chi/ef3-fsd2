import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CartProvider, useCart } from '../context/CartContext';

function TestConsumer() {
  const { items, addItem, total, count } = useCart();
  return (
    <div>
      <button onClick={() => addItem({ id: 1, productName: 'Test', productPrice: 1000 })}>
        Add
      </button>
      <p data-testid="count">{count}</p>
      <p data-testid="total">{total}</p>
      <ul>{items.map(i => <li key={i.id}>{i.productName}</li>)}</ul>
    </div>
  );
}

describe('CartContext', () => {
  it('adds items and updates total', () => {
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    fireEvent.click(screen.getByText('Add'));
    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(screen.getByTestId('total').textContent).toBe('1000');
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('aggregates quantity for same product', () => {
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    fireEvent.click(screen.getByText('Add'));
    fireEvent.click(screen.getByText('Add'));
    expect(screen.getByTestId('count').textContent).toBe('2');
    expect(screen.getByTestId('total').textContent).toBe('2000');
  });
});