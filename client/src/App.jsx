import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Spinner from './components/ui/Spinner';

const LoginPage       = lazy(() => import('./pages/LoginPage'));
const DashboardPage   = lazy(() => import('./pages/DashboardPage'));
const ResumesPage     = lazy(() => import('./pages/ResumesPage'));
const JobsPage        = lazy(() => import('./pages/JobsPage'));
const AnalyzePage     = lazy(() => import('./pages/AnalyzePage'));
const MatchReportPage = lazy(() => import('./pages/MatchReportPage'));
const DiscoverPage    = lazy(() => import('./pages/DiscoverPage'));
const SettingsPage    = lazy(() => import('./pages/SettingsPage'));
const SupportPage     = lazy(() => import('./pages/SupportPage'));
const NotFoundPage    = lazy(() => import('./pages/NotFoundPage'));

const PageLoader = () => (
  <div className="flex items-center justify-center h-full min-h-[300px]">
    <Spinner size={24} className="text-accent" />
  </div>
);

const App = () => (
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/404" element={<NotFoundPage />} />

        {/* Protected — all inside AppShell */}
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/resumes" replace />} />
          <Route path="/dashboard"    element={<DashboardPage />} />
          <Route path="/resumes"      element={<ResumesPage />} />
          <Route path="/jobs"         element={<JobsPage />} />
          <Route path="/analyze"      element={<AnalyzePage />} />
          <Route path="/match-report" element={<MatchReportPage />} />
          <Route path="/discover"     element={<DiscoverPage />} />
          <Route path="/settings"     element={<SettingsPage />} />
          <Route path="/support"      element={<SupportPage />} />
        </Route>

        {/* Catch-all → 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default App;