import { useState } from 'react';
import { motion } from 'framer-motion';
import { useBalance } from '../context/BalanceContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

const PRESETS = [5000, 10000, 25000, 50000, 100000];

export function Balance() {
  const { balance, addFunds } = useBalance();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [custom, setCustom] = useState('');
  const [filling, setFilling] = useState(false);

  const formatCLP = (n) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

  const handleFill = async (amount) => {
    if (!user) {
      toast('Please sign in to fill your balance', 'error');
      navigate('/login');
      return;
    }
    if (amount <= 0) return;
    setFilling(true);
    // Simulate processing delay (2-4s)
    await new Promise(r => setTimeout(r, 2000 + Math.random() * 2000));
    addFunds(amount);
    toast(`Added ${formatCLP(amount)} to your balance`, 'success');
    setFilling(false);
    setCustom('');
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-10 text-center mb-8"
      >
        <p className="text-dino-muted text-sm mb-2">Current Balance</p>
        <motion.p
          key={balance}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="font-display text-6xl font-bold gradient-text mb-2"
        >
          {formatCLP(balance)}
        </motion.p>
        <p className="text-dino-muted text-xs font-mono">CLP · Chilean Peso</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-8"
      >
        <h2 className="font-display text-2xl font-bold mb-6">Fill Balance</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {PRESETS.map(amt => (
            <motion.button
              key={amt}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleFill(amt)}
              disabled={filling}
              className="py-4 rounded-xl border border-dino-accent/30 hover:border-dino-accent
                         hover:bg-dino-accent/10 transition-all font-mono font-bold"
            >
              {formatCLP(amt)}
            </motion.button>
          ))}
        </div>

        <div className="flex gap-3">
          <input
            type="number"
            min="1000"
            step="1000"
            value={custom}
            onChange={e => setCustom(e.target.value)}
            placeholder="Custom amount (CLP)"
            aria-label="Custom amount"
            className="flex-1 px-4 py-3 rounded-xl bg-dino-bg border border-dino-accent/20
                       focus:border-dino-accent focus:outline-none font-mono"
          />
          <button
            onClick={() => handleFill(Number(custom))}
            disabled={filling || !custom}
            className="btn-primary"
          >
            {filling ? 'Processing...' : 'Add'}
          </button>
        </div>

        <p className="text-xs text-dino-muted mt-4 text-center">
          Simulated top-up · No real money involved
        </p>
      </motion.div>
    </div>
  );
}