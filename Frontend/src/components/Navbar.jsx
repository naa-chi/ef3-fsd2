import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useBalance } from '../context/BalanceContext';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';

import { Ltr } from './Ltr';
function SunIcon() { /* unchanged */ }
function MoonIcon() { /* unchanged */ }

export function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { balance } = useBalance();
  const { t } = useLanguage();
  const location = useLocation();

  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || 'light'
  );

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
    { to: '/', label: t('nav.home') },
    { to: '/products', label: t('nav.products') },
    ...(user ? [
      { to: '/cart', label: t('nav.cart') },
      { to: '/orders', label: t('nav.orders') },
      { to: '/account', label: t('nav.account') },
      { to: '/balance', label: t('nav.balance') },
    ] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 glass" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}
            className="w-8 h-8 rounded-md bg-gradient-to-br from-dino-accent to-dino-mint flex items-center justify-center font-bold text-white text-sm"
            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,.5), 0 1px 2px rgba(0,0,0,.2)' }}>
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
              style={{ color: location.pathname === link.to ? 'var(--link)' : 'var(--text-muted)' }}
            >
              {link.label}
              {link.to === '/cart' && count > 0 && (
                <motion.span
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold text-white"
                  style={{ background: 'linear-gradient(to bottom, #f0ad4e 0%, #d9534f 100%)', border: '1px solid #a02a25', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.4)' }}>
                  {count}
                </motion.span>
              )}
              {location.pathname === link.to && (
                <motion.div layoutId="nav-indicator" className="absolute bottom-0 left-1 right-1 h-0.5" style={{ background: 'var(--link)' }} />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <>
              <div className="text-right hidden sm:block">
                <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t('nav.balanceLabel')}</p>
                <p className="font-mono font-bold text-xs" style={{ color: 'var(--link)' }}><Ltr>{formatCLP(balance)}</Ltr></p>
              </div>
              <div className="text-right hidden md:block">
                <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t('nav.hi')}</p>
                <p className="font-bold text-xs">{user.username}</p>
              </div>
              <button onClick={logout} className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary !px-4 !py-1.5 text-xs">{t('nav.signIn')}</Link>
          )}

          <LanguageSwitcher />

          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={theme === 'dark' ? t('nav.theme.switchToLight') : t('nav.theme.switchToDark')}
            title={theme === 'dark' ? t('nav.theme.switchToLight') : t('nav.theme.switchToDark')}
            style={{ /* unchanged inline styles */ }}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            <span className="hidden sm:inline">
              {theme === 'dark' ? t('nav.theme.light') : t('nav.theme.dark')}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}