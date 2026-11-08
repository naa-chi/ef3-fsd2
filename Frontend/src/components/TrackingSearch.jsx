import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { packagesApi } from '../services/api';

export function TrackingSearch() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await packagesApi.getByTrackingCode(code.trim().toUpperCase());
      setResult(data);
    } catch (err) {
      setError('Package not found. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="glass rounded-2xl p-8 text-center mb-8">
        <h2 className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--heading)' }}>
          Track Your Package
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          Enter your tracking code below (e.g., 4E879BF9)
        </p>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Ingrese código de seguimiento..."
            className="flex-1"
            style={{
              background: 'var(--input-bg)',
              color: 'var(--text-main)',
              border: '1px solid var(--input-border)',
              borderRadius: 4,
              padding: '8px 12px'
            }}
          />
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? '...' : 'Buscar'}
          </button>
        </form>

        {error && <p className="text-sm mt-4" style={{ color: 'var(--btn-gloss-2)' }}>{error}</p>}
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-8"
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Tracking Code</p>
                <p className="font-mono font-bold text-xl">{result.orderId}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Current Status</p>
                <p className="font-bold text-lg px-3 py-1 rounded-full inline-block"
                   style={{ background: 'var(--link)', color: '#fff', fontSize: '12px' }}>
                  {result.currentState.replace(/_/g, ' ')}
                </p>
              </div>
            </div>

            {/* Timeline / Historial de Viaje */}
            <h3 className="font-display font-bold text-lg mb-4" style={{ color: 'var(--heading)' }}>
              Historial de Viaje
            </h3>
            
            <div className="space-y-4">
              {(result.historial || []).map((event, idx) => (
                <div key={event.id || idx} className="flex gap-4">
                  {/* Timeline dot and line */}
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full mt-1.5" style={{ background: 'var(--link)' }}></div>
                    {idx !== result.historial.length - 1 && (
                      <div className="w-0.5 flex-1 my-1" style={{ background: 'var(--divider)' }}></div>
                    )}
                  </div>
                  
                  {/* Event details */}
                  <div className="pb-6 flex-1">
                    <p className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>
                      {event.estado.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      📍 {event.ubicacion}
                    </p>
                    <p className="text-[10px] mt-1 font-mono" style={{ color: 'var(--text-muted)' }}>
                      {new Date(event.fecha).toLocaleString('es-CL')}
                    </p>
                  </div>
                </div>
              ))}
              
              {(!result.historial || result.historial.length === 0) && (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  No travel history recorded yet.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}