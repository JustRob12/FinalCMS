// src/components/UserDashboard.jsx

import React from 'react';
import UserNavbar from './UserNavbar';

const UserDashboard = () => {
    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {/* Dashboard Header
            <header className="bg-indigo-600 text-white p-4 rounded-lg shadow">
                <h1 className="text-3xl font-bold">User Dashboard</h1>
                <p className="mt-2 text-sm">Welcome to your dashboard!</p>
            </header> */}

            <UserNavbar />
        </div>
    );
};

export default UserDashboard;
