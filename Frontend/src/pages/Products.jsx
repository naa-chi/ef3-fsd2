import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from '../components/ProductCard';
import { productsApi } from '../services/api';

export function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    productsApi.getAll()
      .then(setProducts)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const types = ['ALL', 'FOOD', 'ELECTRONICS', 'LIQUIDS', 'ALCOHOLIC_BEVERAGES', 'BEVERAGES', 'APPLIANCES', 'OTHER'];
  const filtered = filter === 'ALL' ? products : products.filter(p => p.type === filter);

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

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-dino-danger">Failed to load products: {error}</p>
        <p className="text-dino-muted text-sm mt-2">Make sure the backend is running on port 3770.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="font-display text-4xl font-bold gradient-text mb-2">Products</h1>
        <p className="text-dino-muted">{products.length} items available</p>
      </motion.div>

      <div className="flex flex-wrap gap-2 mb-8" role="tablist" aria-label="Filter by product type">
        {types.map(t => (
          <button
            key={t}
            role="tab"
            aria-selected={filter === t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-full text-sm transition-all ${
              filter === t
                ? 'bg-dino-accent text-white'
                : 'bg-dino-panel text-dino-muted hover:text-dino-text border border-dino-accent/20'
            }`}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <AnimatePresence>
          {filtered.map((p, index) => (
            <ProductCard key={p.id ?? p.Id ?? `product-${index}`} product={p} />
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <p className="text-center text-dino-muted py-20">No products in this category.</p>
      )}
    </div>
  );
}