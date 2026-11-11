import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { I18nProvider, useI18n } from './i18n/I18nContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { BalanceProvider } from './context/BalanceContext';
import { ToastProvider } from './components/Toast';
import { Navbar } from './components/Navbar';
import { MathBackground } from './components/MathBackground';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Products } from './pages/Products';
import { Cart } from './pages/Cart';
import { Orders } from './pages/Orders';
import { Balance } from './pages/Balance';
import { Account } from './pages/Account';

function AppShell() {
  const { t } = useI18n();
  return (
    <>
      <a href="#main-content" className="skip-link">{t('common.skipToMain')}</a>
      <MathBackground />
      <Navbar />
      <main id="main-content" role="main" className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/account" element={<Account />} />
          <Route
            path="/balance"
            element={
              <ProtectedRoute>
                <Balance />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <footer className="text-center py-8 text-dino-muted text-xs">
        <p>{t('footer.copy')}</p>
      </footer>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <I18nProvider>
        <AuthProvider>
          <CartProvider>
            <BalanceProvider>
              <ToastProvider>
                {/* flex-col + min-h-screen + flex-1 on <main> → footer sticks to bottom */}
                <div className="min-h-screen flex flex-col">
                  <AppShell />
                </div>
              </ToastProvider>
            </BalanceProvider>
          </CartProvider>
        </AuthProvider>
      </I18nProvider>
    </BrowserRouter>
  );
}