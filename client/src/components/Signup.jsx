// src/components/Signup.jsx

import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        id: '',
        course: '',
        year: '',
        username: '',
        password: '',
        role: 'user',
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/signup`, formData);
            alert('User created successfully');
            navigate('/login');
        } catch (error) {
            console.error(error);
            alert('Error creating user');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-sm p-4 space-y-5 bg-white shadow-md rounded-md">
                {/* Header Section */}
                <h1 className="text-2xl font-bold text-center text-indigo-700">
                    Welcome to Campus Bite
                </h1>
                <h2 className="text-sm text-center text-gray-500">
                    Please fill in the form to sign up
                </h2>

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    />

                    <div className="flex space-x-2">
                        <input
                            type="text"
                            name="id"
                            placeholder="ID"
                            onChange={handleChange}
                            required
                            className="w-1/2 px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        />
                        <input
                            type="number"
                            name="year"
                            placeholder="Year"
                            onChange={handleChange}
                            required
                            className="w-1/2 px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        />
                    </div>

                    <input
                        type="text"
                        name="course"
                        placeholder="Course"
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    />

                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    />

                    <select
                        name="role"
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>

                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded hover:bg-indigo-700"
                    >
                        Sign Up
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-indigo-600 hover:underline">
                        Go to Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
