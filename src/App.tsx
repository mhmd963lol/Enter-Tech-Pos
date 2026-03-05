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
import AccountSettings from "./pages/AccountSettings";
import StaticPages from "./pages/StaticPages";

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
import { SpeedInsights } from "@vercel/speed-insights/react";

function AppContent() {
  const { user, isAuthLoading } = useAppContext();

  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <SpeedInsights />
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
          <Route path="settings/account" element={<AccountSettings />} />
          <Route path="support" element={<StaticPages />} />
          <Route path="terms" element={<StaticPages />} />
          <Route path="privacy" element={<StaticPages />} />
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  );
}
