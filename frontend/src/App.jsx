import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CreateVoucherPage from './pages/CreateVoucherPage';
import EditVoucherPage from './pages/EditVoucherPage';
import VoucherListPage from './pages/VoucherListPage';
import VoucherDetailPage from './pages/VoucherDetailPage';
import './App.css';

const AppLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return (
    <div className="app-container">
      {isAuthenticated && <Navbar />}
      <main className="main-content">{children}</main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            {/* Public authentication route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Default root redirects to Dashboard */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Navigate to="/dashboard" replace />
                </ProtectedRoute>
              }
            />

            {/* Dashboard (Role-specific view) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['employee', 'director', 'accounts']}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Create Voucher */}
            <Route
              path="/create"
              element={
                <ProtectedRoute allowedRoles={['employee', 'director', 'accounts']}>
                  <CreateVoucherPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vouchers/create"
              element={
                <ProtectedRoute allowedRoles={['employee', 'director', 'accounts']}>
                  <CreateVoucherPage />
                </ProtectedRoute>
              }
            />

            {/* Edit Voucher */}
            <Route
              path="/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['employee', 'director', 'accounts']}>
                  <EditVoucherPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vouchers/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['employee', 'director', 'accounts']}>
                  <EditVoucherPage />
                </ProtectedRoute>
              }
            />

            {/* Pending Approvals (Director only) */}
            <Route
              path="/vouchers/pending"
              element={
                <ProtectedRoute allowedRoles={['director']}>
                  <VoucherListPage />
                </ProtectedRoute>
              }
            />

            {/* Voucher List (My Vouchers for Employee, All Vouchers for Director & Accounts) */}
            <Route
              path="/vouchers"
              element={
                <ProtectedRoute allowedRoles={['employee', 'director', 'accounts']}>
                  <VoucherListPage />
                </ProtectedRoute>
              }
            />

            {/* Voucher Details & Print view */}
            <Route
              path="/vouchers/:id"
              element={
                <ProtectedRoute allowedRoles={['employee', 'director', 'accounts']}>
                  <VoucherDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
