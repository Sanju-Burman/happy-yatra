import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { getStoredUser, getStoredTokens } from '@/api';
import Navbar from '@/components/Navbar.jsx';
import Landing from '@/pages/Landing.jsx';
import Login from '@/pages/Login.jsx';
import Signup from '@/pages/Signup.jsx';
import Survey from '@/pages/Survey.jsx';
import Recommendations from '@/pages/Recommendations.jsx';
import DestinationDetail from '@/pages/DestinationDetail.jsx';
import Profile from '@/pages/Profile.jsx';
import ThankYou from '@/pages/ThankYou.jsx';
import './App.css';

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

  return (
    <div className="App relative min-h-screen bg-background text-foreground transition-colors duration-300">
      <BrowserRouter>
        <Navbar user={user} setUser={setUser} />
        <Routes>
          <Route path="/" element={<Landing user={user} />} />
          <Route path="/login" element={<PublicRoute><Login setUser={setUser} /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup setUser={setUser} /></PublicRoute>} />
          <Route path="/survey" element={<ProtectedRoute><Survey /></ProtectedRoute>} />
          <Route path="/thank-you" element={<ProtectedRoute><ThankYou /></ProtectedRoute>} />
          <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
          <Route path="/destination/:id" element={<ProtectedRoute><DestinationDetail /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
    </div>
  );
}

export default App;