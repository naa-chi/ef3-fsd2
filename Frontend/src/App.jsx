import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { BalanceProvider } from './context/BalanceContext';
import { LanguageProvider } from './i18n/LanguageContext';
import { ToastProvider } from './components/Toast';
// ... your existing imports

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <BalanceProvider>
              <ToastProvider>
                {/* ... unchanged */}
              </ToastProvider>
            </BalanceProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}