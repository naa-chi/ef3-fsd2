import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useBalance } from '../context/BalanceContext';

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { balance } = useBalance();
  const location = useLocation();

  const [theme, setTheme] = useState(() => {
    return document.documentElement.getAttribute('data-theme') || 'light';
  });

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('dinobox_theme', next);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const formatCLP = (n) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

  const links = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    ...(user ? [
      { to: '/cart', label: 'Cart' },
      { to: '/orders', label: 'Orders' },
      { to: '/account', label: 'Account' },
      { to: '/balance', label: 'Balance' }
    ] : [])
  ];

  return (
    <nav className="sticky top-0 z-50 glass" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-3">

        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="w-8 h-8 rounded-md bg-gradient-to-br from-dino-accent to-dino-mint flex items-center justify-center font-bold text-white text-sm"
            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,.5), 0 1px 2px rgba(0,0,0,.2)' }}
          >
            D
          </motion.div>
          <span className="font-display font-bold text-lg" style={{ color: 'var(--heading)' }}>
            DinoBox <span className="new-badge ml-1">beta</span>
          </span>
        </Link>

        <div className="flex items-center gap-1 flex-wrap justify-center">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="relative px-3 py-1.5 text-xs font-bold uppercase tracking-wider"
              style={{
                color: location.pathname === link.to ? 'var(--link)' : 'var(--text-muted)'
              }}
            >
              {link.label}
              {link.label === 'Cart' && count > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold text-white"
                  style={{
                    background: 'linear-gradient(to bottom, #f0ad4e 0%, #d9534f 100%)',
                    border: '1px solid #a02a25',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,.4)'
                  }}
                >
                  {count}
                </motion.span>
              )}
              {location.pathname === link.to && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute bottom-0 left-1 right-1 h-0.5"
                  style={{ background: 'var(--link)' }}
                />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <>
              <div className="text-right hidden sm:block">
                <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Balance
                </p>
                <p className="font-mono font-bold text-xs" style={{ color: 'var(--link)' }}>
                  {formatCLP(balance)}
                </p>
              </div>
              <div className="text-right hidden md:block">
                <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Hi,
                </p>
                <p className="font-bold text-xs">{user.username}</p>
              </div>
              <button
                onClick={logout}
                className="text-xs font-bold"
                style={{ color: 'var(--text-muted)' }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary !px-4 !py-1.5 text-xs">
              Sign In
            </Link>
          )}

          {/* THEME TOGGLE — bulletproof: inline styles + CSS class + visible label */}
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              height: 28,
              padding: '0 10px',
              borderRadius: 999,
              border: '1px solid var(--input-border, #a4b8cc)',
              background: theme === 'dark'
                ? 'linear-gradient(to bottom, #3a4553 0%, #232b36 50%, #151b23 100%)'
                : 'linear-gradient(to bottom, #ffffff 0%, #e2ecf6 50%, #cdd9e6 100%)',
              color: theme === 'dark' ? '#ffd166' : '#1e2a38',
              fontFamily: 'Tahoma, Verdana, Arial, sans-serif',
              fontSize: 11,
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,.5), 0 1px 2px rgba(0,0,0,.15)',
              flexShrink: 0
            }}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            <span className="hidden sm:inline">
              {theme === 'dark' ? 'Light' : 'Dark'}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}