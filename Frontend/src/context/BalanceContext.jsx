import { createContext, useContext, useState, useEffect } from 'react';

const BalanceContext = createContext(null);

export function BalanceProvider({ children }) {
  // Lazy init: read localStorage synchronously BEFORE first render
  const [balance, setBalance] = useState(() => {
    const stored = localStorage.getItem('dinobox_balance');
    return stored ? Number(stored) : 0;
  });

  // Persist on every change (safe now because init isn't 0)
  useEffect(() => {
    localStorage.setItem('dinobox_balance', balance);
  }, [balance]);

  const addFunds = (amount) => setBalance(b => b + amount);
  const deduct = (amount) => {
    if (balance < amount) throw new Error('Insufficient funds');
    setBalance(b => b - amount);
  };

  return (
    <BalanceContext.Provider value={{ balance, addFunds, deduct }}>
      {children}
    </BalanceContext.Provider>
  );
}

export const useBalance = () => {
  const ctx = useContext(BalanceContext);
  if (!ctx) throw new Error('useBalance must be used within BalanceProvider');
  return ctx;
};