import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OrderTracker } from '../components/OrderTracker';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [archivedIds, setArchivedIds] = useState(() => {
    const stored = localStorage.getItem('dinobox_archived_orders');
    return new Set(stored ? JSON.parse(stored) : []);
  });
  const [showReceipts, setShowReceipts] = useState(false);
  const { user } = useAuth();
  const receiptRef = useRef(null);

  
  // Persist archived list
  useEffect(() => {
    localStorage.setItem('dinobox_archived_orders', JSON.stringify([...archivedIds]));
  }, [archivedIds]);

  useEffect(() => {
    const loadHistory = async () => {
      if (!user) { setLoading(false); return; }
      try {
        const res = await api.get(`/orders/history/${user.username}`);
        setOrders(res.data);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
    const interval = setInterval(loadHistory, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleOrderComplete = (orderId) => {
    setArchivedIds(prev => new Set([...prev, orderId]));
  };

  const activeOrders = orders.filter(o => !archivedIds.has(o.id));
  const archivedOrders = orders.filter(o => archivedIds.has(o.id));

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h1 className="font-display text-3xl font-bold gradient-text mb-4">Please Sign In</h1>
        <p className="text-dino-muted">You need to be logged in to view your order history.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 rounded-full border-2 border-dino-accent border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 relative">
      <motion.h1
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="font-display text-4xl font-bold gradient-text mb-2"
      >
        Your Deliveries
      </motion.h1>
      <p className="text-dino-muted mb-8">Track active packages — completed ones fly to your receipts.</p>

      {activeOrders.length === 0 && archivedOrders.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-dino-muted">No orders yet. Start shopping!</p>
        </div>
      ) : activeOrders.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">✨</div>
          <p className="text-dino-muted">All caught up! Click the receipt icon to view past orders.</p>
        </div>
      ) : (
        <motion.div layout className="grid md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {activeOrders.map((o) => (
              <motion.div
                key={o.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  x: 500, y: 500, scale: 0.05, opacity: 0, rotate: 45,
                  transition: { duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96] }
                }}
              >
                <OrderTracker
                  order={{
                    id: o.id,
                    orderId: o.packageOrderId,
                    location: 'See package details',
                    currentState: o.currentState,
                    totalPaid: o.totalAmount,
                    isRefunded: o.status === 'REFUNDED'
                  }}
                  onComplete={() => handleOrderComplete(o.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Floating Receipt Icon */}
      <motion.button
        ref={receiptRef}
        onClick={() => setShowReceipts(s => !s)}
        className="fixed bottom-8 right-8 z-40 glass rounded-2xl p-4 w-24 h-24 flex flex-col items-center justify-center border-2 border-dino-accent/30 hover:border-dino-accent transition-colors"
        animate={archivedIds.size > 0 ? { scale: [1, 1.08, 1] } : {}}
        transition={{ duration: 0.5 }}
        aria-label="View receipts"
      >
        <span className="text-3xl">🧾</span>
        <span className="text-[10px] text-dino-muted uppercase tracking-wider mt-1">Receipts</span>
        <AnimatePresence>
          {archivedIds.size > 0 && (
            <motion.span
              key={archivedIds.size}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-2 -right-2 bg-dino-accent text-white text-xs rounded-full w-7 h-7 flex items-center justify-center font-bold"
            >
              {archivedIds.size}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Receipts Panel */}
      <AnimatePresence>
        {showReceipts && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-36 right-8 z-40 glass rounded-2xl w-80 max-h-[60vh] overflow-y-auto p-4"
          >
            <h3 className="font-display font-bold text-sm mb-3 text-dino-text">Archived Receipts</h3>
            {archivedOrders.length === 0 ? (
              <p className="text-xs text-dino-muted">Nothing here yet.</p>
            ) : (
              <div className="space-y-2">
                {archivedOrders.map(o => (
                  <div key={o.id} className="bg-dino-bg/50 rounded-lg p-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-dino-text">{o.packageOrderId}</span>
                      <span className={`px-2 py-0.5 rounded-full ${
                        o.status === 'REFUNDED' ? 'bg-dino-mint/20 text-dino-mint' : 'bg-dino-accent/20 text-dino-glow'
                      }`}>
                        {o.currentState?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between text-dino-muted mt-1">
                      <span>{o.purchaseDate}</span>
                      <span className="font-mono">${o.totalAmount?.toLocaleString('es-CL')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}