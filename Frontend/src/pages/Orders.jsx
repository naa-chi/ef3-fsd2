import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { OrderTracker } from '../components/OrderTracker';
import { packagesApi } from '../services/api';

export function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await packagesApi.getAll();
        // Sort by ID descending (newest first)
        const sorted = data.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
        setOrders(sorted);
      } catch (e) {
        console.error('Failed to load orders', e);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    
    load();
    const interval = setInterval(load, 10000); // Poll every 10s to catch backend updates
    return () => clearInterval(interval);
  }, []);

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
    <div className="max-w-5xl mx-auto px-6 py-12">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-4xl font-bold gradient-text mb-8"
      >
        Your Orders
      </motion.h1>

      {orders.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-dino-muted">No orders yet. Start shopping!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {orders.map((o, i) => (
            <motion.div
              key={o.orderId ?? o.id ?? `order-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <OrderTracker order={o} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}