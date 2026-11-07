import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useBalance } from '../context/BalanceContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { balance } = useBalance();
  const location = useLocation();

  const formatCLP = (n) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

  const links = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    ...(user ? [
      { to: '/cart', label: 'Cart' },
      { to: '/orders', label: 'Orders' },
      { to: '/balance', label: 'Balance' }
    ] : [])
  ];

  return (
    <nav className="sticky top-0 z-50 glass border-b border-dino-accent/10" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-dino-accent to-dino-mint flex items-center justify-center font-bold"
          >
            D
          </motion.div>
          <span className="font-display font-bold text-xl gradient-text">DinoBox</span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="relative px-4 py-2 text-sm text-dino-muted hover:text-dino-text transition-colors"
            >
              {link.label}
              {link.label === 'Cart' && count > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-dino-accent text-white text-xs flex items-center justify-center"
                >
                  {count}
                </motion.span>
              )}
              {location.pathname === link.to && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-dino-accent to-dino-mint"
                />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="text-right">
                <p className="text-xs text-dino-muted">Balance</p>
                <p className="font-mono font-bold text-dino-mint text-sm">{formatCLP(balance)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-dino-muted">Hi,</p>
                <p className="font-medium text-sm">{user.username}</p>
              </div>
              <button
                onClick={logout}
                className="text-sm text-dino-muted hover:text-dino-danger transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary !px-4 !py-2 text-sm">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}