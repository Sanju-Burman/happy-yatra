import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import NavigationService from '@/lib/navigationService';
import Navbar from '@/components/Navbar.jsx';
import Landing from '@/pages/Landing.jsx';

const Login = React.lazy(() => import('@/pages/Login.jsx'));
const Signup = React.lazy(() => import('@/pages/Signup.jsx'));
const ForgotPassword = React.lazy(() => import('@/pages/ForgotPassword.jsx'));
const ResetPassword = React.lazy(() => import('@/pages/ResetPassword.jsx'));
const Survey = React.lazy(() => import('@/pages/Survey.jsx'));
const Recommendations = React.lazy(() => import('@/pages/Recommendations.jsx'));
const DestinationDetail = React.lazy(() => import('@/pages/DestinationDetail.jsx'));
const Profile = React.lazy(() => import('@/pages/Profile.jsx'));
const ThankYou = React.lazy(() => import('@/pages/ThankYou.jsx'));

const AdminDashboard = React.lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminDestinations = React.lazy(() => import('@/pages/admin/AdminDestinations'));
const AdminUsers = React.lazy(() => import('@/pages/admin/AdminUsers'));
const AdminAnalytics = React.lazy(() => import('@/pages/admin/AdminAnalytics'));

// ─── Splash Screen ───────────────────────────────────────────────────────────
// Shown while AuthContext is validating the stored session on startup.
// Prevents any protected route from rendering before auth state is resolved.

const SplashScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-muted-foreground text-sm font-medium">Loading…</p>
    </div>
  </div>
);

// ─── Route Guards ────────────────────────────────────────────────────────────
// Defined OUTSIDE the App render function so React never unmounts/remounts
// them on re-renders (avoids the flashing-UI bug from closure recreation).

const ProtectedRoute = ({ children }) => {
  const { authStatus } = useAuth();
  if (authStatus === 'loading') return <SplashScreen />;
  return authStatus === 'authenticated' ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { authStatus } = useAuth();
  if (authStatus === 'loading') return <SplashScreen />;
  return authStatus === 'unauthenticated' ? children : <Navigate to="/" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, authStatus } = useAuth();
  if (authStatus === 'loading') return <SplashScreen />;
  if (authStatus === 'unauthenticated') return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

// ─── NavigationService Registrar ─────────────────────────────────────────────
// A tiny component that lives inside <BrowserRouter> so it has access to
// useNavigate(). It registers the navigate fn with NavigationService once,
// enabling the Axios interceptor to use client-side routing.

const NavigationRegistrar = () => {
  const navigate = useNavigate();
  useEffect(() => {
    NavigationService.setNavigate(navigate);
  }, [navigate]);
  return null;
};

// ─── Router Content ───────────────────────────────────────────────────────────
// Extracted so that NavigationRegistrar is always rendered inside <BrowserRouter>.

const AppRoutes = () => {
  const { user, logout } = useAuth();

  return (
    <>
      <NavigationRegistrar />
      <Navbar user={user} onLogout={logout} />
      <React.Suspense fallback={<SplashScreen />}>
        <Routes>
          <Route path="/" element={<Landing user={user} />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
          <Route path="/survey" element={<ProtectedRoute><Survey /></ProtectedRoute>} />
          <Route path="/thank-you" element={<ProtectedRoute><ThankYou /></ProtectedRoute>} />
          <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
          <Route path="/destination/:id" element={<ProtectedRoute><DestinationDetail /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>}>
            <Route index element={<AdminAnalytics />} />
            <Route path="destinations" element={<AdminDestinations />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>
        </Routes>
      </React.Suspense>
      <Toaster position="top-right" />
    </>
  );
};

// ─── App Root ─────────────────────────────────────────────────────────────────

function App() {
  return (
    <div className="App relative min-h-screen bg-background text-foreground transition-colors duration-300 z-[1]">
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;