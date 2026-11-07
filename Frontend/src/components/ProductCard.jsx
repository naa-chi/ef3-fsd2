import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';

/**
 * Mathematically-defined product icon based on ProductType.
 * Each type maps to a parametric SVG shape.
 */
function ProductIcon({ type }) {
  const shapes = {
    FOOD: (
      <g>
        <circle cx="40" cy="40" r="28" fill="none" stroke="#34d399" strokeWidth="2" />
        <path d="M 20 40 Q 40 10, 60 40 T 100 40" fill="none" stroke="#34d399" strokeWidth="1.5"
              transform="translate(-20, 0) scale(0.8)" />
      </g>
    ),
    ELECTRONICS: (
      <g>
        <rect x="15" y="20" width="50" height="40" rx="4" fill="none" stroke="#7c5cff" strokeWidth="2" />
        <line x1="20" y1="30" x2="60" y2="30" stroke="#7c5cff" strokeWidth="1" />
        <line x1="20" y1="40" x2="50" y2="40" stroke="#7c5cff" strokeWidth="1" />
        <circle cx="55" cy="50" r="3" fill="#a78bfa" />
      </g>
    ),
    LIQUIDS: (
      <g>
        <path d="M 30 15 L 50 15 L 55 30 L 55 65 Q 55 70, 50 70 L 30 70 Q 25 70, 25 65 L 25 30 Z"
              fill="none" stroke="#60a5fa" strokeWidth="2" />
        <path d="M 28 45 Q 40 40, 52 45" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
      </g>
    ),
    ALCOHOLIC_BEVERAGES: (
      <g>
        <path d="M 30 20 L 50 20 L 48 35 L 52 65 L 28 65 L 32 35 Z"
              fill="none" stroke="#f59e0b" strokeWidth="2" />
        <line x1="32" y1="45" x2="48" y2="45" stroke="#f59e0b" strokeWidth="1" />
      </g>
    ),
    BEVERAGES: (
      <g>
        <rect x="25" y="15" width="30" height="55" rx="3" fill="none" stroke="#34d399" strokeWidth="2" />
        <rect x="30" y="25" width="20" height="15" fill="#34d399" opacity="0.3" />
      </g>
    ),
    APPLIANCES: (
      <g>
        <rect x="15" y="20" width="50" height="50" rx="6" fill="none" stroke="#a78bfa" strokeWidth="2" />
        <circle cx="40" cy="45" r="12" fill="none" stroke="#a78bfa" strokeWidth="1.5" />
        <circle cx="40" cy="45" r="4" fill="#a78bfa" />
      </g>
    ),
    OTHER: (
      <g>
        <polygon points="40,15 65,30 65,55 40,70 15,55 15,30"
                 fill="none" stroke="#9ca3af" strokeWidth="2" />
      </g>
    )
  };

  return (
    <svg viewBox="0 0 80 80" className="w-20 h-20">
      {shapes[type] || shapes.OTHER}
    </svg>
  );
}

export function ProductCard({ product }) {
  const { addItem } = useCart();

  const formatCLP = (n) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="glass rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group"
      aria-label={`Product: ${product.productName}`}
    >
      {/* Decorative glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-dino-accent/20 rounded-full blur-3xl
                      group-hover:bg-dino-accent/40 transition-colors duration-500"
           aria-hidden="true" />

      <div className="flex justify-center relative z-10">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          <ProductIcon type={product.type} />
        </motion.div>
      </div>

      <div className="relative z-10 flex-1">
        <h3 className="font-display font-semibold text-lg text-dino-text mb-1">
          {product.productName}
        </h3>
        <p className="text-xs text-dino-muted font-mono uppercase tracking-wider mb-2">
          {product.manufacturer}
        </p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-dino-muted">Stock: {product.productStock}</span>
          <span className="px-2 py-0.5 rounded-full bg-dino-accent/20 text-dino-glow text-xs">
            {product.type.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between pt-3 border-t border-dino-accent/10">
        <span className="font-display font-bold text-xl gradient-text">
          {formatCLP(product.productPrice)}
        </span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => addItem(product)}
          className="btn-primary !px-4 !py-2 text-sm"
          aria-label={`Add ${product.productName} to cart`}
        >
          Add +
        </motion.button>
      </div>
    </motion.article>
  );
}