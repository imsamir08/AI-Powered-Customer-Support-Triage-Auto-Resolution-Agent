import { Navigate, Route, Routes } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { AdminRoute } from './components/common/AdminRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DashboardPage } from './features/bugs/pages/DashboardPage';
import { KanbanPage } from './features/bugs/pages/KanbanPage';
import { BugsListPage } from './features/bugs/pages/BugsListPage';
import { AuthPage } from './features/auth/pages/AuthPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { ResetPasswordPage } from './features/auth/pages/ResetPasswordPage';
import { ProfilePage } from './features/profile/pages/ProfilePage';
import { AdminDashboardPage } from './features/admin/pages/AdminDashboardPage';
import { AuditLogsPage } from './features/audit/pages/AuditLogsPage';
import { LandingPage } from './features/landing/pages/LandingPage';
import { AITriagePage } from './features/ai/pages/AITriagePage';

function AppShell() {
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/reset-password/:resetToken" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)]">
      <Navbar />
      <div className="flex min-h-[calc(100vh-72px)] pb-20 lg:pb-0">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 py-5 md:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/ai-triage" element={<AITriagePage />} />
            <Route path="/kanban" element={<KanbanPage />} />
            <Route path="/bugs" element={<BugsListPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/audit" element={<AuditLogsPage />} />
            <Route path="/auth" element={<Navigate to="/dashboard" replace />} />
            <Route path="/register" element={<Navigate to="/dashboard" replace />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/reset-password/:resetToken" element={<ResetPasswordPage />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ThemeProvider>
  );
}
