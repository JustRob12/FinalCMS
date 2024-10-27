import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = ({ setUser }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Check if the user is already logged in
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            // Redirect to the appropriate dashboard
            navigate(userData.role === 'admin' ? '/admin-dashboard' : '/user-dashboard');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/login`, {
                username,
                password,
            });

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setUser(response.data.user);

            navigate(response.data.user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-sm p-4 space-y-5 bg-white shadow-md rounded-md">
                {/* Header Section */}
                <h1 className="text-2xl font-bold text-center text-indigo-700">
                    Welcome Back to Campus Bite
                </h1>
                <h2 className="text-sm text-center text-gray-500">
                    Please enter your credentials to log in
                </h2>

                {/* Form Section */}
                {error && <p className="text-red-500 text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block mb-1 text-sm">Username:</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm">Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded hover:bg-indigo-700"
                    >
                        Login
                    </button>
                </form>
                <p className="text-center text-sm text-gray-500">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-indigo-600 hover:underline">
                        Go to Signup
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
