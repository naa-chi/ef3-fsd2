import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useBalance } from '../context/BalanceContext';
import { useAuth } from '../context/AuthContext';
import { useLocation as useGeoLocation } from '../hooks/useLocation';
import { packagesApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

export function Cart() {
  const { items, updateQty, removeItem, clearCart, total } = useCart();
  const { balance, deduct } = useBalance();
  const { user } = useAuth();
  const geo = useGeoLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const [section, setSection] = useState('');
  const [address, setAddress] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);

  const formatCLP = (n) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

  const handleCheckout = async () => {
    if (!user) {
      toast('Please sign in to checkout', 'error');
      navigate('/login');
      return;
    }
    if (total > balance) {
      toast('Insufficient balance. Please top up.', 'error');
      return;
    }
    if (!section || !address) {
      toast('Please fill in section and address', 'error');
      return;
    }

    setCheckingOut(true);
    try {
      const pkg = await packagesApi.create({
        currentState: 'PENDING',
        location: `${geo.city || 'Unknown'} · ${section} · ${address}`
      });
      
      // Save order details (including the exact items list) for consistent display
      const orderDetails = {
        totalPaid: total,
        items: items.map(i => ({
          name: i.productName,
          qty: i.qty,
          price: i.productPrice
        }))
      };
      localStorage.setItem(`dinobox_order_${pkg.orderId}`, JSON.stringify(orderDetails));

      deduct(total);
      clearCart();
      toast('Order placed! Tracking started.', 'success');
      navigate('/orders');
    } catch (e) {
      toast('Checkout failed: ' + e.message, 'error');
    } finally {
      setCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-6">🛒</motion.div>
        <h1 className="font-display text-3xl font-bold mb-3">Your cart is empty</h1>
        <p className="text-dino-muted mb-6">Browse our products to get started.</p>
        <button onClick={() => navigate('/products')} className="btn-primary">Browse Products</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl font-bold gradient-text mb-8">
        Your Cart
      </motion.h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence>
            {items.map((item, index) => (
              <motion.div
                key={item.id ?? item.Id ?? `cart-item-${index}`}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="glass rounded-xl p-4 flex items-center gap-4"
              >
                <div className="flex-1">
                  <h3 className="font-semibold">{item.productName}</h3>
                  <p className="text-xs text-dino-muted">{item.manufacturer}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item.id ?? item.Id, item.qty - 1)} className="w-8 h-8 rounded-lg bg-dino-bg hover:bg-dino-accent/20 transition-colors" aria-label="Decrease quantity">−</button>
                  <span className="w-8 text-center font-mono">{item.qty}</span>
                  <button onClick={() => updateQty(item.id ?? item.Id, item.qty + 1)} className="w-8 h-8 rounded-lg bg-dino-bg hover:bg-dino-accent/20 transition-colors" aria-label="Increase quantity">+</button>
                </div>
                <p className="font-mono font-bold w-28 text-right gradient-text">
                  {formatCLP(item.productPrice * item.qty)}
                </p>
                <button onClick={() => removeItem(item.id ?? item.Id)} className="text-dino-danger hover:text-dino-danger/80 transition-colors" aria-label={`Remove ${item.productName}`}>✕</button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 h-fit sticky top-24">
          <h2 className="font-display text-xl font-bold mb-4">Delivery Details</h2>

          <div className="mb-4 p-3 rounded-lg bg-dino-bg border border-dino-accent/10">
            <p className="text-xs text-dino-muted">Detected City</p>
            <p className="font-semibold">{geo.loading ? 'Detecting...' : geo.city || 'Santiago'}</p>
          </div>

          <div className="space-y-3 mb-6">
            <div>
              <label htmlFor="section" className="block text-sm text-dino-muted mb-1">Section / District</label>
              <input id="section" value={section} onChange={e => setSection(e.target.value)} placeholder="e.g. Providencia" className="w-full px-3 py-2 rounded-lg bg-dino-bg border border-dino-accent/20 focus:border-dino-accent focus:outline-none text-sm" />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm text-dino-muted mb-1">Street Address</label>
              <input id="address" value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. Av. Providencia 1234" className="w-full px-3 py-2 rounded-lg bg-dino-bg border border-dino-accent/20 focus:border-dino-accent focus:outline-none text-sm" />
            </div>
          </div>

          <div className="border-t border-dino-accent/10 pt-4 mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-dino-muted">Subtotal</span>
              <span className="font-mono">{formatCLP(total)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-dino-muted">Delivery</span>
              <span className="font-mono text-dino-mint">Free</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-dino-accent/10">
              <span>Total</span>
              <span className="gradient-text">{formatCLP(total)}</span>
            </div>
          </div>

          <div className="text-xs text-dino-muted mb-4">
            Your balance: <span className="font-mono text-dino-mint">{formatCLP(balance)}</span>
          </div>

          <button onClick={handleCheckout} disabled={checkingOut} className="btn-primary w-full">
            {checkingOut ? 'Processing...' : 'Place Order'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}