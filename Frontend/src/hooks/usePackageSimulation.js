import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

export function usePackageSimulation(orderId, trackingCode, initialState = 'PENDING') {
  const [state, setState] = useState(initialState);
  const [nextChangeIn, setNextChangeIn] = useState(null);
  const timerRef = useRef(null);

  if (!orderId || initialState === 'ARRIVED' || initialState === 'LOST') {
    return { state: initialState, nextChangeIn: null };
  }

  const skewedDelay = () => Math.round(10 + Math.pow(Math.random(), 0.5) * 50);
  const normalDelay = () => Math.round(10 + Math.random() * 50);

  useEffect(() => {
    if (!orderId || state === 'ARRIVED' || state === 'LOST') return;

    // Use trackingCode for localStorage
    const storageKey = `dinobox_simulation_${trackingCode}`;
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
          const finalData = { state: nextState, nextStateTime: null };
          localStorage.setItem(storageKey, JSON.stringify(finalData));
          setState(nextState);
          setNextChangeIn(null);
          
          // Use orderId (DB Long) for API call
          try { await api.put(`/orders/${orderId}`, { currentState: nextState }); } 
          catch (e) { console.error("State update failed", e); }
          return;
        }

        const nextDelay = normalDelay();
        const newData = { state: nextState, nextStateTime: Date.now() + nextDelay * 1000 };
        localStorage.setItem(storageKey, JSON.stringify(newData));
        setState(nextState);
        
        // Use orderId (DB Long) for API call
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