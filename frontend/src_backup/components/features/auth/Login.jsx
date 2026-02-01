// src/components/auth/Login.jsx
import React, { useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";

const Login = () => {
    const { loginUser } = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        // mock login
        loginUser({ email }, "access-token", "refresh-token");
    };

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
            <button type="submit">Login</button>
        </form>
    );
};

export default Login;
