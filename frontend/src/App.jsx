import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { getStoredUser, getStoredTokens } from '@/api';
import Navbar from '@/components/Navbar.jsx';
import Landing from '@/pages/Landing.jsx';

const Login = React.lazy(() => import('@/pages/Login.jsx'));
const Signup = React.lazy(() => import('@/pages/Signup.jsx'));
const Survey = React.lazy(() => import('@/pages/Survey.jsx'));
const Recommendations = React.lazy(() => import('@/pages/Recommendations.jsx'));
const DestinationDetail = React.lazy(() => import('@/pages/DestinationDetail.jsx'));
const Profile = React.lazy(() => import('@/pages/Profile.jsx'));
const ThankYou = React.lazy(() => import('@/pages/ThankYou.jsx'));

const AdminDashboard = React.lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminDestinations = React.lazy(() => import('@/pages/admin/AdminDestinations'));
const AdminUsers = React.lazy(() => import('@/pages/admin/AdminUsers'));
const AdminAnalytics = React.lazy(() => import('@/pages/admin/AdminAnalytics'));

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = getStoredUser();
    const { accessToken } = getStoredTokens();

    if (storedUser && accessToken) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const ProtectedRoute = ({ children }) => {
    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    return user ? children : <Navigate to="/login" />;
  };

  const PublicRoute = ({ children }) => {
    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    return !user ? children : <Navigate to="/" />;
  };

  const AdminRoute = ({ user, children }) => {
    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'admin') return <Navigate to="/" replace />;
    return children;
  };

  return (
    <div className="App relative min-h-screen bg-background text-foreground transition-colors duration-300 z-[1]">
      <BrowserRouter>
        <Navbar user={user} setUser={setUser} />
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Landing user={user} />} />
            <Route path="/login" element={<PublicRoute><Login setUser={setUser} /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup setUser={setUser} /></PublicRoute>} />
            <Route path="/survey" element={<ProtectedRoute><Survey /></ProtectedRoute>} />
            <Route path="/thank-you" element={<ProtectedRoute><ThankYou /></ProtectedRoute>} />
            <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
            <Route path="/destination/:id" element={<ProtectedRoute><DestinationDetail /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute user={user}><AdminDashboard setUser={setUser} /></AdminRoute>}>
              <Route index element={<AdminAnalytics />} />
              <Route path="destinations" element={<AdminDestinations />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="analytics" element={<AdminAnalytics />} />
            </Route>
          </Routes>
        </React.Suspense>
        <Toaster position="top-right" />
      </BrowserRouter>
    </div>
  );
}

export default App;