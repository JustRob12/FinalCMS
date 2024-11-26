// src/components/Signup.jsx

import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        id: '',
        gsisId: '',
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
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/signup`, formData);
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

                    {/* Show GSIS ID field only when role is faculty */}
                    {formData.role === 'faculty' && (
                        <input
                            type="text"
                            name="gsisId"
                            placeholder="GSIS ID"
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        />
                    )}

                    {/* Dropdown for Course */}
                    <select
                        name="course"
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    >
                        <option value="" disabled>Select Course</option>
                        <option value="Bachelor of Science in Nursing">Bachelor of Science in Nursing</option>
                        <option value="Bachelor of Elementary Education">Bachelor of Elementary Education</option>
                        <option value="Bachelor of Early Childhood Education">Bachelor of Early Childhood Education</option>
                        <option value="Bachelor of Special Needs Education">Bachelor of Special Needs Education</option>
                        <option value="Bachelor Physical Education">Bachelor Physical Education</option>
                        <option value="Bachelor of Technology and Livelihood Education major in Home Economics">Bachelor of Technology and Livelihood Education major in Home Economics</option>
                        <option value="Bachelor of Technology and Livelihood Education major in Industrial Arts">Bachelor of Technology and Livelihood Education major in Industrial Arts</option>
                        <option value="Bachelor of Secondary Education major in Filipino">Bachelor of Secondary Education major in Filipino</option>
                        <option value="Bachelor of Secondary Education major in English">Bachelor of Secondary Education major in English</option>
                        <option value="Bachelor of Secondary Education major in Mathematics">Bachelor of Secondary Education major in Mathematics</option>
                        <option value="Bachelor of Secondary Education major in Science">Bachelor of Secondary Education major in Science</option>
                        <option value="Bachelor in Industrial Technology Management major in Automotive Technology">Bachelor in Industrial Technology Management major in Automotive Technology</option>
                        <option value="Bachelor of Science in Civil Engineering">Bachelor of Science in Civil Engineering</option>
                        <option value="Bachelor of Science in Information Technology">Bachelor of Science in Information Technology</option>
                        <option value="Bachelor of Science in Mathematics">Bachelor of Science in Mathematics</option>
                        <option value="Bachelor of Science in Mathematics with Research Statistics">Bachelor of Science in Mathematics with Research Statistics</option>
                        <option value="Bachelor of Science in Business Administration">Bachelor of Science in Business Administration</option>
                        <option value="Bachelor of Science in Criminology">Bachelor of Science in Criminology</option>
                        <option value="Bachelor of Science in Hospitality Management">Bachelor of Science in Hospitality Management</option>
                        <option value="Bachelor of Science in Agribusiness Management">Bachelor of Science in Agribusiness Management</option>
                        <option value="Bachelor of Science in Biology major in Animal Biology">Bachelor of Science in Biology major in Animal Biology</option>
                        <option value="Bachelor of Science in Agriculture major in Animal Science">Bachelor of Science in Agriculture major in Animal Science</option>
                        <option value="Bachelor of Science in Agriculture major in Crop Science">Bachelor of Science in Agriculture major in Crop Science</option>
                        <option value="Bachelor of Science in Biology">Bachelor of Science in Biology</option>
                        <option value="Bachelor of Science in Biology major in Ecology">Bachelor of Science in Biology major in Ecology</option>
                        <option value="Bachelor of Science in Environmental Science">Bachelor of Science in Environmental Science</option>
                        <option value="Bachelor of Science in Development Communication">Bachelor of Science in Development Communication</option>
                        <option value="Bachelor of Arts in Political Science">Bachelor of Arts in Political Science</option>
                        <option value="Bachelor of Science in Psychology">Bachelor of Science in Psychology</option>
                    </select>

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
                        <option value="faculty">Faculty</option>
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
