import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useBalance } from '../context/BalanceContext';
import { useAuth } from '../context/AuthContext';
import { useLocation as useGeoLocation } from '../hooks/useLocation';
import api, { packagesApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { useLanguage } from '../i18n/LanguageContext';
import { Ltr } from '../components/Ltr';

export function Cart() {
  const { items, updateQty, removeItem, clearCart, total } = useCart();
  const { balance, deduct } = useBalance();
  const { user } = useAuth();
  const geo = useGeoLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useLanguage();

  const [section, setSection] = useState('');
  const [address, setAddress] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);

  const formatCLP = (n) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

  const handleCheckout = async () => {
    if (!user) {
      toast(t('cart.err.signIn'), 'error');
      navigate('/login');
      return;
    }
    if (!user.username) {
      toast(t('cart.err.corrupt'), 'error');
      return;
    }
    if (total > balance) {
      toast(t('cart.err.insufficient'), 'error');
      return;
    }
    if (!section || !address) {
      toast(t('cart.err.fill'), 'error');
      return;
    }

    setCheckingOut(true);
    try {
      const pkg = await packagesApi.create({
        currentState: 'PENDING',
        location: `${geo.city || 'Unknown'} · ${section} · ${address}`,
      });
      if (!pkg || !pkg.orderId) throw new Error(t('cart.err.noTracking'));

      await api.post('/orders', {
        username: user.username,
        packageOrderId: pkg.orderId,
        totalAmount: total,
      });

      localStorage.setItem(
        `dinobox_order_${pkg.orderId}`,
        JSON.stringify({
          totalPaid: total,
          items: items.map(i => ({ name: i.productName, qty: i.qty, price: i.productPrice })),
        })
      );

      deduct(total);
      clearCart();
      toast(t('cart.ok.placed'), 'success');
      navigate('/orders');
    } catch (e) {
      // Spring often returns {timestamp, status, error, message}; stringify objects
      const raw = e.response?.data;
      const msg =
        typeof raw === 'string' ? raw
        : raw?.message ?? raw?.error ?? e.message;
      toast(t('cart.err.checkout', { msg }), 'error');
    } finally {
      setCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-6">🛒</motion.div>
        <h1 className="font-display text-3xl font-bold mb-3">{t('cart.empty.title')}</h1>
        <p className="text-dino-muted mb-6">{t('cart.empty.desc')}</p>
        <button onClick={() => navigate('/products')} className="btn-primary">{t('cart.browse')}</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl font-bold gradient-text mb-8">
        {t('cart.title')}
      </motion.h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="glass rounded-xl p-4 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{item.productName}</h3>
                  <p className="text-xs text-dino-muted truncate">{item.manufacturer}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => updateQty(item.id, item.qty - 1)}
                    className="w-8 h-8 rounded-lg bg-dino-bg hover:bg-dino-accent/20 transition-colors"
                    aria-label={t('cart.decrease')}>−</button>
                  <span className="w-8 text-center font-mono">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.qty + 1)}
                    className="w-8 h-8 rounded-lg bg-dino-bg hover:bg-dino-accent/20 transition-colors"
                    aria-label={t('cart.increase')}>+</button>
                </div>
                <p className="font-mono font-bold w-28 text-right gradient-text">
                  <Ltr><Ltr>{formatCLP(item.productPrice * item.qty)}</Ltr></Ltr>
                </p>
                <button onClick={() => removeItem(item.id)}
                  className="text-dino-danger hover:text-dino-danger/80 transition-colors"
                  aria-label={t('cart.remove', { name: item.productName })}>✕</button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 h-fit sticky top-24">
          <h2 className="font-display text-xl font-bold mb-4">{t('cart.deliveryDetails')}</h2>

          <div className="mb-4 p-3 rounded-lg bg-dino-bg border border-dino-accent/10">
            <p className="text-xs text-dino-muted">{t('cart.detectedCity')}</p>
            <p className="font-semibold">
              {geo.loading ? t('cart.detecting') : geo.city || 'Santiago'}
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <div>
              <label htmlFor="section" className="block text-sm text-dino-muted mb-1">{t('cart.section')}</label>
              <input id="section" value={section} onChange={e => setSection(e.target.value)}
                placeholder={t('cart.sectionPlaceholder')}
                className="w-full px-3 py-2 rounded-lg bg-dino-bg border border-dino-accent/20 focus:border-dino-accent focus:outline-none text-sm" />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm text-dino-muted mb-1">{t('cart.address')}</label>
              <input id="address" value={address} onChange={e => setAddress(e.target.value)}
                placeholder={t('cart.addressPlaceholder')}
                className="w-full px-3 py-2 rounded-lg bg-dino-bg border border-dino-accent/20 focus:border-dino-accent focus:outline-none text-sm" />
            </div>
          </div>

          <div className="border-t border-dino-accent/10 pt-4 mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-dino-muted">{t('cart.subtotal')}</span>
              <span className="font-mono"><Ltr><Ltr>{formatCLP(total)}</Ltr></Ltr></span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-dino-muted">{t('cart.delivery')}</span>
              <span className="font-mono text-dino-mint">{t('cart.free')}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-dino-accent/10">
              <span>{t('cart.total')}</span>
              <span className="gradient-text"><Ltr><Ltr>{formatCLP(total)}</Ltr></Ltr></span>
            </div>
          </div>

          <div className="text-xs text-dino-muted mb-4">
            {t('cart.yourBalance')} <span className="font-mono text-dino-mint"><Ltr><Ltr>{formatCLP(balance)}</Ltr></Ltr></span>
          </div>

          <button onClick={handleCheckout} disabled={checkingOut} className="btn-primary w-full">
            {checkingOut ? t('cart.processing') : t('cart.placeOrder')}
          </button>
        </motion.div>
      </div>
    </div>
  );
}