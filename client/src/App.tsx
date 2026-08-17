import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { AppLayout } from './layouts/AppLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';

// Private Pages
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { StudentDetailPage } from './pages/StudentDetailPage';
import { GuardiansPage } from './pages/GuardiansPage';
import { HostelsPage } from './pages/HostelsPage';
import { FloorsPage } from './pages/FloorsPage';
import { RoomsPage } from './pages/RoomsPage';
import { BedsPage } from './pages/BedsPage';
import { AllocationsPage } from './pages/AllocationsPage';
import { FeesPage } from './pages/FeesPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { AttendancePage } from './pages/AttendancePage';
import { LeavesPage } from './pages/LeavesPage';
import { VisitorsPage } from './pages/VisitorsPage';
import { GatePassesPage } from './pages/GatePassesPage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { MessPage } from './pages/MessPage';
import { NoticesPage } from './pages/NoticesPage';
import { ReportsPage } from './pages/ReportsPage';
import { UsersPage } from './pages/UsersPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { SkeletonLoader } from './components/SkeletonLoader';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <SkeletonLoader rows={6} type="card" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected ERP Application Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/students/:id" element={<StudentDetailPage />} />
              <Route path="/guardians" element={<GuardiansPage />} />
              <Route path="/hostels" element={<HostelsPage />} />
              <Route path="/floors" element={<FloorsPage />} />
              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/beds" element={<BedsPage />} />
              <Route path="/allocations" element={<AllocationsPage />} />
              <Route path="/fees" element={<FeesPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/leaves" element={<LeavesPage />} />
              <Route path="/visitors" element={<VisitorsPage />} />
              <Route path="/gate-passes" element={<GatePassesPage />} />
              <Route path="/complaints" element={<ComplaintsPage />} />
              <Route path="/maintenance" element={<MaintenancePage />} />
              <Route path="/mess" element={<MessPage />} />
              <Route path="/notices" element={<NoticesPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/audit-logs" element={<AuditLogsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
