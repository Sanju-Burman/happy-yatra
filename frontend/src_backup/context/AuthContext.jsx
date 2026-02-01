// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from "react";
import { refreshToken } from "../utils/api";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [refreshAccessToken, setRefreshAccessToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const loginUser = useCallback((user, access, refresh) => {
        setUser(user);
        setAccessToken(access);
        setRefreshAccessToken(refresh);

        localStorage.setItem("User", JSON.stringify(user));
        localStorage.setItem("accessToken", access);
        localStorage.setItem("refreshAccessToken", refresh);
    }, []);

    const logoutUser = useCallback(() => {
        setUser(null);
        setAccessToken(null);
        setRefreshAccessToken(null);

        localStorage.removeItem("User");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshAccessToken");
    }, []);

    useEffect(() => {
        const storedUser = localStorage.getItem("User");
        const storedAccessToken = localStorage.getItem("accessToken");
        const storedRefreshAccessToken = localStorage.getItem("refreshAccessToken");

        if (storedUser && storedAccessToken && storedRefreshAccessToken) {
            try {
                setUser(JSON.parse(storedUser));
                setAccessToken(storedAccessToken);
                setRefreshAccessToken(storedRefreshAccessToken);
            } catch (err) {
                console.error("Failed to parse user data:", err);
                logoutUser();
            }
        }
        setLoading(false);
    }, [logoutUser]);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const data = await refreshToken();
                localStorage.setItem("accessToken", data.accessToken);
                setAccessToken(data.accessToken);
                console.log("🔄 Access token refreshed");
            } catch (err) {
                console.error("Failed to refresh token:", err.message);
                logoutUser(); // optional: auto logout on refresh fail
            }
        }, 14 * 60 * 1000); // 14 minutes

        return () => clearInterval(interval);
    }, [logoutUser]);

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                refreshAccessToken,
                loginUser,
                logoutUser,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;