import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrackingSearch } from '../components/TrackingSearch';

export function Home() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20">

      {/* ─── Hero ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="inline-block mb-6"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-dino-accent to-dino-mint
                          flex items-center justify-center text-5xl animate-pulse-glow">
            🦖
          </div>
        </motion.div>

        <h1 className="font-display text-6xl md:text-7xl font-bold mb-6">
          <span className="gradient-text">DinoBox</span>
        </h1>

        <p className="text-xl text-dino-muted max-w-2xl mx-auto mb-10">
          A beautifully chaotic delivery simulation. Browse products, track packages
          through unpredictable journeys, and experience the thrill of modern logistics.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/products" className="btn-primary">
            Browse Products
          </Link>

          {/* Top Up Balance — inline-styled to survive theme toggling */}
          <Link
            to="/balance"
            style={{
              display: 'inline-block',
              padding: '8px 20px',
              fontFamily: 'Tahoma, Verdana, Arial, sans-serif',
              fontSize: 12,
              fontWeight: 'bold',
              borderRadius: 4,
              cursor: 'pointer',
              textDecoration: 'none',
              color: 'var(--text-main)',
              border: '1px solid var(--input-border)',
              background: 'linear-gradient(to bottom, var(--panel-grad-1) 0%, var(--panel-grad-2) 50%, var(--surface-sunken) 100%)',
              textShadow: '0 1px 0 rgba(255, 255, 255, 0.35)',
              boxShadow: 'inset 0 1px 0 var(--panel-highlight), 0 1px 2px rgba(0, 0, 0, 0.10)',
              transition: 'filter 0.15s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.filter = 'brightness(1.06)')}
            onMouseOut={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
          >
            Top Up Balance
          </Link>
        </div>
      </motion.div>

      {/* ─── Divider ──────────────────────────────────────── */}
      <div className="my-16 flex items-center gap-4">
        <div className="flex-1 h-px" style={{ background: 'var(--divider)' }} />
        <span className="text-xs uppercase tracking-widest font-bold" style={{ color: 'var(--text-muted)' }}>
          Public Tracking
        </span>
        <div className="flex-1 h-px" style={{ background: 'var(--divider)' }} />
      </div>

      {/* ─── Public Tracking Search ───────────────────────── */}
      <TrackingSearch />

      {/* ─── Feature Cards ────────────────────────────────── */}
      <div className="grid md:grid-cols-3 gap-6 mt-20">
        {[
          { icon: '📦', title: 'Track Everything', desc: 'Real-time state machine simulation with unpredictable outcomes.' },
          { icon: '🌎', title: 'Location Aware', desc: 'We detect your city automatically for faster checkout.' },
          { icon: '💎', title: 'Robux-Style Balance', desc: 'Top up, spend, and get refunds on lost packages.' }
        ].map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="glass rounded-2xl p-6 hover:border-dino-accent/40 transition-colors"
          >
            <div className="text-4xl mb-4">{f.icon}</div>
            <h3 className="font-display font-semibold text-lg mb-2" style={{ color: 'var(--heading)' }}>
              {f.title}
            </h3>
            <p className="text-dino-muted text-sm">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}