import { createContext, useContext, useState, useEffect } from 'react';

const BalanceContext = createContext(null);

export function BalanceProvider({ children }) {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('dinobox_balance');
    if (stored) setBalance(Number(stored));
  }, []);

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