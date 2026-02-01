import React, { useState } from "react";
import Login from "../components/auth/Login";
import Signup from "../components/auth/Signup";

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
    };

    return (
        <div className="max-w-md mx-auto p-6 border rounded-md shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-center">
                {isLogin ? "Login" : "Registration"}
            </h2>
            {isLogin ? <Login /> : <Signup />}
            <div className="mt-4 text-center">
                {isLogin ? (
                    <div>
                        Don't have an account? <text onClick={toggleAuthMode}>Sign Up</text>
                    </div>
                ) : (
                    <div onClick={toggleAuthMode}>
                            Already have an account? <text onClick={toggleAuthMode}>Login</text>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthPage;