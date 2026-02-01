import React, { useState } from "react";
import { signup } from "../../utils/api";
import { toast } from "react-toastify";

const Signup = () => {
    const [formData, setFormData] = useState({ username: "", email: "", password: "" });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await signup(formData); // Call signup API
            toast.success(response.message || "Signup successful!");
        } catch (error) {
            toast.error(error.message || "Signup failed. Please try again.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label>Full Name</label>
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    required
                />
            </div>
            <div>
                <label className="block text-gray-700">Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    required
                />
            </div>
            <div>
                <label className="block text-gray-700">Password</label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    required
                />
            </div>
            <button type="submit" className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700">
                Sign Up
            </button>
        </form>
    );
};

export default Signup;