import { useState, useEffect, useRef } from 'react';
import { packagesApi } from '../services/api';

export function usePackageSimulation(orderId, initialState = 'PENDING') {
  const [state, setState] = useState(initialState);
  const [nextChangeIn, setNextChangeIn] = useState(null);
  const timerRef = useRef(null);

  // STRICT GUARD: If no ID or already finished, do absolutely nothing.
  if (!orderId || initialState === 'ARRIVED' || initialState === 'LOST') {
    return { state: initialState, nextChangeIn: null };
  }

  const skewedDelay = () => Math.round(10 + Math.pow(Math.random(), 0.5) * 50);
  const normalDelay = () => Math.round(10 + Math.random() * 50);

  useEffect(() => {
    // Double-check guard inside effect
    if (!orderId || state === 'ARRIVED' || state === 'LOST') return;

    const storageKey = `dinobox_simulation_${orderId}`;
    let simData = JSON.parse(localStorage.getItem(storageKey) || 'null');

    // Initialize simulation data ONLY if it doesn't exist or state legitimately changed
    if (!simData || simData.state !== state) {
      const delay = state === 'PENDING' ? skewedDelay() : normalDelay();
      simData = {
        state,
        nextStateTime: Date.now() + delay * 1000,
      };
      localStorage.setItem(storageKey, JSON.stringify(simData));
    }

    const tick = () => {
      const currentData = JSON.parse(localStorage.getItem(storageKey));
      if (!currentData) return;
      
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((currentData.nextStateTime - now) / 1000));
      setNextChangeIn(remaining);

      if (now >= currentData.nextStateTime) {
        let nextState = state;
        
        if (state === 'PENDING') {
          nextState = 'EN_ROUTE';
        } else if (state === 'EN_ROUTE') {
          nextState = Math.random() < 0.5 ? 'WE_HAVE_NO_IDEA' : (Math.random() < 0.66 ? 'ARRIVED' : 'LOST');
        } else if (state === 'WE_HAVE_NO_IDEA') {
          nextState = Math.random() < 0.66 ? 'ARRIVED' : 'LOST';
        }

        if (nextState === 'ARRIVED' || nextState === 'LOST') {
          const finalData = { state: nextState, nextStateTime: null };
          localStorage.setItem(storageKey, JSON.stringify(finalData));
          setState(nextState);
          setNextChangeIn(null);
          packagesApi.update(orderId, { currentState: nextState }).catch(console.error);
          return; // Stop execution, timer is dead
        }

        const nextDelay = normalDelay();
        const newData = {
          state: nextState,
          nextStateTime: Date.now() + nextDelay * 1000
        };
        localStorage.setItem(storageKey, JSON.stringify(newData));
        setState(nextState);
        packagesApi.update(orderId, { currentState: nextState }).catch(console.error);
      }
    };

    tick();
    timerRef.current = setInterval(tick, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [orderId, state]);

  return { state, nextChangeIn };
}