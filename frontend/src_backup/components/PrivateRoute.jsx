import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = () => {
            const accessToken = localStorage.getItem("accessToken");
            if (accessToken) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
            setLoading(false);
        };

        return () => unsubscribe(); // Cleanup subscription
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;