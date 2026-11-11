import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

export function usePackageSimulation(orderId, trackingCode, initialState = 'PENDING') {
  const [state, setState] = useState(initialState);
  const [nextChangeIn, setNextChangeIn] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!orderId || state === 'ARRIVED' || state === 'LOST') {
      return undefined;
    }

    const storageKey = `dinobox_simulation_${trackingCode}`;

    const skewedDelay = () => Math.round(10 + Math.pow(Math.random(), 0.5) * 50);
    const normalDelay = () => Math.round(10 + Math.random() * 50);

    let simData = JSON.parse(localStorage.getItem(storageKey) || 'null');

    if (!simData || simData.state !== state) {
      const delay = state === 'PENDING' ? skewedDelay() : normalDelay();
      simData = { state, nextStateTime: Date.now() + delay * 1000 };
      localStorage.setItem(storageKey, JSON.stringify(simData));
    }

    const tick = async () => {
      const currentData = JSON.parse(localStorage.getItem(storageKey));
      if (!currentData) return;

      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((currentData.nextStateTime - now) / 1000));
      setNextChangeIn(remaining);

      if (now >= currentData.nextStateTime) {
        let nextState = state;

        if (state === 'PENDING') nextState = 'EN_ROUTE';
        else if (state === 'EN_ROUTE') nextState = Math.random() < 0.5 ? 'WE_HAVE_NO_IDEA' : (Math.random() < 0.66 ? 'ARRIVED' : 'LOST');
        else if (state === 'WE_HAVE_NO_IDEA') nextState = Math.random() < 0.66 ? 'ARRIVED' : 'LOST';

        if (nextState === 'ARRIVED' || nextState === 'LOST') {
          localStorage.setItem(storageKey, JSON.stringify({ state: nextState, nextStateTime: null }));
          setState(nextState);
          setNextChangeIn(null);

          try { await api.put(`/orders/${orderId}`, { currentState: nextState }); }
          catch (e) { console.error("State update failed", e); }
          return;
        }

        const nextDelay = normalDelay();
        localStorage.setItem(storageKey, JSON.stringify({ state: nextState, nextStateTime: Date.now() + nextDelay * 1000 }));
        setState(nextState);

        try { await api.put(`/orders/${orderId}`, { currentState: nextState }); }
        catch (e) { console.error("State update failed", e); }
      }
    };

    tick();
    timerRef.current = setInterval(tick, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [orderId, trackingCode, state]);

  return { state, nextChangeIn };
}