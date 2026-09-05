import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getStoredUser,
  getStoredTokens,
  storeUser,
  storeTokens,
  clearTokens,
  isTokenExpired,
  refreshAccessToken,
  logout as apiLogout,
} from '@/api';
import NavigationService from '@/lib/navigationService';

/**
 * AuthContext
 *
 * Provides a single source of truth for authentication state across the app.
 *
 * authStatus values:
 *   'loading'         — startup validation is in progress; render a splash screen
 *   'authenticated'   — user session is valid; protected routes may render
 *   'unauthenticated' — no valid session; redirect to /login
 *
 * Why this exists:
 *   The previous pattern stored user state directly in App.jsx via useState and
 *   read it from localStorage without checking token expiry. This caused three
 *   problems:
 *     1. An expired token in localStorage was treated as a valid session, so
 *        protected APIs fired before the 401 interceptor could act.
 *     2. Route guards were recreated on every App render (closures inside render).
 *     3. logout() lived in multiple places (Navbar, interceptor) with no
 *        coordination, causing race conditions between redirects.
 */

// ─── Context ────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

// ─── Provider ───────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authStatus, setAuthStatus] = useState('loading');

  /**
   * initializeAuth
   *
   * Runs once on app startup. Implements the startup state machine:
   *
   *   APP_START
   *     ↓
   *   LOAD_LOCAL_SESSION
   *     ↓
   *   VALIDATE_ACCESS_TOKEN (client-side exp check — no API call)
   *     ↓
   *   REFRESH_IF_REQUIRED   (one API call, only when needed)
   *     ↓
   *   AUTH_SUCCESS  → set status 'authenticated'
   *   AUTH_FAILURE  → clear state, set status 'unauthenticated'
   */
  useEffect(() => {
    let cancelled = false;

    const initializeAuth = async () => {
      const storedUser = getStoredUser();
      const { accessToken, refreshToken } = getStoredTokens();

      // No session at all → go straight to unauthenticated
      if (!storedUser || !accessToken) {
        if (!cancelled) setAuthStatus('unauthenticated');
        return;
      }

      // Access token still valid → restore session immediately
      if (!isTokenExpired(accessToken)) {
        if (!cancelled) {
          setUser(storedUser);
          setAuthStatus('authenticated');
        }
        return;
      }

      // Access token expired — try to silently refresh using the refresh token
      if (!refreshToken || isTokenExpired(refreshToken)) {
        // Both tokens dead → force logout
        clearTokens();
        if (!cancelled) setAuthStatus('unauthenticated');
        return;
      }

      try {
        const newAccessToken = await refreshAccessToken();
        // refreshAccessToken already calls storeTokens() internally
        if (!cancelled) {
          setUser(storedUser);
          setAuthStatus('authenticated');
        }
      } catch {
        // Refresh failed (revoked, network error, etc.) → clean logout
        clearTokens();
        if (!cancelled) setAuthStatus('unauthenticated');
      }
    };

    initializeAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * login
   * Called after a successful login/signup API response to hydrate auth state.
   *
   * @param {object} userData  - The user object returned by the API
   * @param {string} accessToken
   * @param {string} refreshToken
   */
  const login = useCallback((userData, accessToken, refreshToken) => {
    storeTokens(accessToken, refreshToken);
    storeUser(userData);
    setUser(userData);
    setAuthStatus('authenticated');
  }, []);

  /**
   * logout
   * Centralized logout — the single place that:
   *   1. Calls the backend to blacklist tokens
   *   2. Clears all local state and storage
   *   3. Navigates to the login page
   *
   * All other logout triggers (Navbar button, 401 interceptor) should call
   * this function so that state is always cleaned up consistently.
   */
  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Backend logout is best-effort; proceed regardless
    } finally {
      clearTokens();
      setUser(null);
      setAuthStatus('unauthenticated');
      NavigationService.navigate('/', { replace: true });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, authStatus, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ───────────────────────────────────────────────────────────────────

/**
 * useAuth
 * Consume the AuthContext from any component.
 * Throws if used outside of <AuthProvider>.
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
};
