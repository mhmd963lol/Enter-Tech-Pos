/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useAppContext } from "./context/AppContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import POS from "./pages/POS";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Orders from "./pages/Orders";
import SettingsPage from "./pages/Settings";
import Customers from "./pages/Customers";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import Maintenance from "./pages/Maintenance";
import Placeholder from "./pages/Placeholder";
import BarcodeGenerator from "./pages/BarcodeGenerator";
import Purchases from "./pages/Purchases";
import NewPurchase from "./pages/NewPurchase";
import Suppliers from "./pages/Suppliers";
import DebtorsCreditors from "./pages/DebtorsCreditors";
import Employees from "./pages/Employees";
import Expenses from "./pages/Expenses";
import Income from "./pages/Income";
import PaymentsCenter from "./pages/PaymentsCenter";
import Inbox from "./pages/Inbox";
import StaticPages from "./pages/StaticPages";
import { Download } from "lucide-react";
import CashierTechLogo from "./components/CashierTechLogo";
import { motion, AnimatePresence } from "motion/react";

function PWAInstallPopup() {
  const { deferredPrompt, user } = useAppContext();
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const hasShown = localStorage.getItem("pwa_install_shown");
    // Show after login, if prompt is available and not shown before
    if (user && deferredPrompt && !hasShown) {
      setShow(true);
    }
  }, [user, deferredPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      localStorage.setItem("pwa_install_shown", "true");
      setShow(false);
    }
  };

  const handleClose = () => {
    localStorage.setItem("pwa_install_shown", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl z-[100] p-6 border border-zinc-200 dark:border-zinc-800 shadow-indigo-500/10"
        dir="rtl"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-zinc-100 dark:border-zinc-800">
            <CashierTechLogo showText={false} className="w-10 h-10" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
              تثبيت كاشير تك
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              احصل على تجربة أسرع وأفضل عبر تثبيت التطبيق على جهازك مباشرة والعمل
              كأنه برنامج حقيقي.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleInstall}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
              >
                تثبيت الآن
              </button>
              <button
                onClick={handleClose}
                className="px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold rounded-xl transition-all hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                لاحقاً
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthLoading } = useAppContext();

  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

import { Toaster } from "react-hot-toast";
import SetupWizardModal from "./components/SetupWizardModal";
import { useLocation } from "react-router-dom";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  declare props: Readonly<{ children: React.ReactNode }>;
  state = { hasError: false, error: null as any };
  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error };
  }
  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: '#fff1f1', color: '#c53030', fontFamily: 'monospace', minHeight: '100vh', overflow: 'auto' }}>
          <h1 style={{ borderBottom: '2px solid #feb2b2', paddingBottom: '10px' }}>⚠️ Critical Application Error</h1>
          <div style={{ marginTop: '20px' }}>
            <strong>Message:</strong>
            <pre style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #fed7d7', marginTop: '10px', whiteSpace: 'pre-wrap' }}>
              {this.state.error?.message}
            </pre>
          </div>
          <div style={{ marginTop: '20px' }}>
            <strong>Stack Trace:</strong>
            <pre style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #fed7d7', marginTop: '10px', fontSize: '12px', overflow: 'auto' }}>
              {this.state.error?.stack}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { user, isAuthLoading, settings, setIsCartOpen } = useAppContext();
  const location = useLocation();

  React.useEffect(() => {
    // Auto-open on POS, auto-close elsewhere
    if (location.pathname === "/pos") {
      setIsCartOpen(true);
    } else {
      setIsCartOpen(false);
    }
  }, [location.pathname, setIsCartOpen]);

  React.useEffect(() => {
    // Apply data-theme to HTML tag for CSS selectors
    if (settings?.masterTheme) {
      document.documentElement.setAttribute("data-theme", settings.masterTheme);
    } else {
      document.documentElement.setAttribute("data-theme", "default");
    }
  }, [settings?.masterTheme]);

  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <SetupWizardModal />
      <PWAInstallPopup />
      <Toaster position="top-center" />
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="pos" element={<POS />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
          <Route path="reports" element={<Reports />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="settings" element={<SettingsPage />} />

          {/* New Routes */}
          <Route path="purchases" element={<Purchases />} />
          <Route path="purchases/new" element={<NewPurchase />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route
            path="customers/debtors"
            element={<DebtorsCreditors type="debtors" />}
          />
          <Route
            path="customers/creditors"
            element={<DebtorsCreditors type="creditors" />}
          />
          <Route
            path="customers/export"
            element={<Placeholder title="استخراج العملاء" />}
          />
          <Route path="employees" element={<Employees />} />
          <Route path="finance/expenses" element={<Expenses />} />
          <Route path="finance/income" element={<Income />} />
          <Route path="payments" element={<PaymentsCenter />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="tools/barcode" element={<BarcodeGenerator />} />
        </Route>
        {/* Public Static Pages (Moved outside for Google Verification) */}
        <Route path="/support" element={<StaticPages />} />
        <Route path="/terms" element={<StaticPages />} />
        <Route path="/privacy" element={<StaticPages />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}
