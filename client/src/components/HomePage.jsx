// src/components/Home.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <h1 className="text-4xl font-bold mb-4">Welcome to Our Application</h1>
            <p className="mb-8 text-lg">Please log in or sign up to continue.</p>
            <div className="space-x-4">
                <Link to="/login">
                    <button className="px-6 py-2 bg-white text-indigo-600 font-semibold rounded hover:bg-indigo-50">
                        Login
                    </button>
                </Link>
                <Link to="/signup">
                    <button className="px-6 py-2 bg-indigo-700 text-white font-semibold rounded hover:bg-indigo-800">
                        Sign Up
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default Home;
