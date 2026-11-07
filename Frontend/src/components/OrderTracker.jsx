import { motion, AnimatePresence } from 'framer-motion';
import { usePackageSimulation } from '../hooks/usePackageSimulation';
import { useBalance } from '../context/BalanceContext';
import { useState, useEffect } from 'react';

const STATE_CONFIG = {
  PENDING:          { label: 'Pending',          color: '#f59e0b', icon: '⏳' },
  EN_ROUTE:         { label: 'En Route',         color: '#60a5fa', icon: '🚚' },
  WE_HAVE_NO_IDEA:  { label: 'We Have No Idea',  color: '#a78bfa', icon: '🌀' },
  ARRIVED:          { label: 'Arrived',          color: '#34d399', icon: '✓' },
  LOST:             { label: 'Lost',             color: '#ef4444', icon: '✗' }
};

export function OrderTracker({ order }) {
  // Use orderId (string) for consistent simulation tracking
  const orderId = order.orderId || order.id;
  const { state, nextChangeIn } = usePackageSimulation(orderId, order.currentState);
  const { addFunds } = useBalance();
  const [refunding, setRefunding] = useState(false);
  const [refunded, setRefunded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Retrieve saved order details (products list)
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    if (orderId) {
      const saved = localStorage.getItem(`dinobox_order_${orderId}`);
      if (saved) setOrderDetails(JSON.parse(saved));
    }
  }, [orderId]);

  const config = STATE_CONFIG[state] || STATE_CONFIG.PENDING;
  const isTerminal = state === 'ARRIVED' || state === 'LOST';
  const totalPaid = orderDetails?.totalPaid || order.totalPaid || 0;

  const handleRefund = async () => {
    setRefunding(true);
    const delay = 20 + Math.random() * 10; // 20-30s
    await new Promise(r => setTimeout(r, delay * 1000));
    addFunds(totalPaid);
    setRefunded(true);
    setRefunding(false);
  };

  const formatCLP = (n) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

  return (
    <motion.div layout className="glass rounded-2xl p-5 relative overflow-hidden" aria-live="polite">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-dino-muted font-mono">Order #{orderId}</p>
          <p className="text-sm text-dino-text mt-1">{order.location}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-dino-muted">Total</p>
          <p className="font-bold gradient-text">{formatCLP(totalPaid)}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <motion.div
          key={state}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{ background: `${config.color}20`, border: `2px solid ${config.color}` }}
        >
          {config.icon}
        </motion.div>
        <div>
          <p className="font-semibold" style={{ color: config.color }}>{config.label}</p>
          {!isTerminal && nextChangeIn !== null && (
            <p className="text-xs text-dino-muted font-mono">
              Next update in {nextChangeIn}s
            </p>
          )}
        </div>
      </div>

      <div className="h-1.5 bg-dino-bg rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full"
          style={{ background: config.color }}
          initial={{ width: '0%' }}
          animate={{
            width: state === 'PENDING' ? '20%' :
                   state === 'EN_ROUTE' ? '50%' :
                   state === 'WE_HAVE_NO_IDEA' ? '70%' : '100%'
          }}
          transition={{ duration: 0.8 }}
        />
      </div>

      {/* Expandable Order Details */}
      {orderDetails?.items && orderDetails.items.length > 0 && (
        <div className="border-t border-dino-accent/10 pt-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-dino-glow hover:text-dino-accent transition-colors flex items-center gap-1"
          >
            {showDetails ? 'Hide' : 'View'} purchased items ({orderDetails.items.length})
            <span className={`transform transition-transform ${showDetails ? 'rotate-180' : ''}`}>▼</span>
          </button>
          
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-2 space-y-2"
              >
                {orderDetails.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm bg-dino-bg/50 p-2 rounded-lg">
                    <span className="text-dino-text">{item.qty}x {item.name}</span>
                    <span className="font-mono text-dino-muted">{formatCLP(item.price * item.qty)}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {state === 'LOST' && !refunded && totalPaid > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <button
              onClick={handleRefund}
              disabled={refunding}
              className="w-full btn-primary !py-2 text-sm"
            >
              {refunding ? 'Processing refund...' : 'Request Refund'}
            </button>
          </motion.div>
        )}
        {refunded && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-dino-mint text-sm font-medium mt-4"
          >
            ✓ Refunded {formatCLP(totalPaid)} to your balance
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}