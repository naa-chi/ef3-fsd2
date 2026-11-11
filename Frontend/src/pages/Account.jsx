import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBalance } from '../context/BalanceContext';
import { useLocation } from '../hooks/useLocation';
import api from '../services/api';

import { Ltr } from '../components/Ltr';
export function Account() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { balance } = useBalance();
  const geo = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatCLP = (n) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api.get(`/orders/history/${user.username}`)
      .then(r => setOrders(r.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h1 className="font-display text-3xl font-bold gradient-text mb-4">Please Sign In</h1>
        <Link to="/login" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  const totalSpent = orders
    .filter(o => o.status === 'ACTIVE')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalRefunded = orders
    .filter(o => o.status === 'REFUNDED')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <motion.h1
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="font-display text-4xl font-bold gradient-text mb-2"
      >
        My Account
      </motion.h1>
      <p className="text-dino-muted mb-10">Profile, location, and billing history.</p>

      {/* Profile + Location + Balance Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6"
        >
          <p className="text-xs text-dino-muted uppercase tracking-wider mb-2">Profile</p>
          <p className="font-display font-bold text-xl text-dino-text">{user.username}</p>
          <p className="text-sm text-dino-muted mt-1">{user.email}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6"
        >
          <p className="text-xs text-dino-muted uppercase tracking-wider mb-2">Approx. Location</p>
          <p className="font-display font-bold text-xl text-dino-text">
            {geo.loading ? 'Detecting...' : geo.city || 'Unknown'}
          </p>
          <p className="text-xs text-dino-muted mt-1">Based on IP / GPS</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <p className="text-xs text-dino-muted uppercase tracking-wider mb-2">Balance</p>
          <p className="font-display font-bold text-xl gradient-text"><Ltr>{formatCLP(balance)}</Ltr></p>
          <Link to="/balance" className="text-xs text-dino-glow hover:underline">Top up →</Link>
        </motion.div>
      </div>

      {/* Billing Summary */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="glass rounded-2xl p-5">
          <p className="text-xs text-dino-muted mb-1">Total Spent</p>
          <p className="font-mono font-bold text-2xl text-dino-text"><Ltr>{formatCLP(totalSpent)}</Ltr></p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="text-xs text-dino-muted mb-1">Total Refunded</p>
          <p className="font-mono font-bold text-2xl text-dino-mint"><Ltr>{formatCLP(totalRefunded)}</Ltr></p>
        </div>
      </div>

      {/* Billing History Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-dino-accent/10">
          <h2 className="font-display text-xl font-bold">Billing History</h2>
          <p className="text-xs text-dino-muted mt-1">Every transaction on your account.</p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-dino-muted text-sm">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-dino-muted">No transactions yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-dino-bg/50 text-xs uppercase text-dino-muted">
                <tr>
                  <th className="text-left px-6 py-3">Date</th>
                  <th className="text-left px-6 py-3">Order #</th>
                  <th className="text-left px-6 py-3">State</th>
                  <th className="text-right px-6 py-3">Amount</th>
                  <th className="text-right px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const stored = localStorage.getItem(`dinobox_order_${o.packageOrderId}`);
                  const details = stored ? JSON.parse(stored) : null;
                  const itemsLabel = details?.items
                    ? `${details.items.reduce((s, i) => s + i.qty, 0)} item(s)`
                    : '—';
                  return (
                    <tr key={o.id} className="border-t border-dino-accent/10 hover:bg-dino-bg/30 transition-colors">
                      <td className="px-6 py-3 font-mono text-xs text-dino-muted">{o.purchaseDate}</td>
                      <td className="px-6 py-3 font-mono text-xs">{o.packageOrderId}</td>
                      <td className="px-6 py-3 text-xs">{o.currentState?.replace(/_/g, ' ')}</td>
                      <td className="px-6 py-3 text-right font-mono"><Ltr>{formatCLP(o.totalAmount)}</Ltr></td>
                      <td className="px-6 py-3 text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          o.status === 'REFUNDED'
                            ? 'bg-dino-mint/20 text-dino-mint'
                            : 'bg-dino-accent/20 text-dino-glow'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}