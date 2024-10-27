// src/components/AdminDashboard.jsx

import React from 'react';

const AdminDashboard = () => {
    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {/* Dashboard Header */}
            <header className="bg-indigo-600 text-white p-4 rounded-lg shadow">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="mt-2 text-sm">Welcome, Admin! Here are your controls.</p>
            </header>

            {/* Admin Controls Section */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Example Admin Control Cards */}
                <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
                    <h2 className="text-xl font-semibold">Manage Users</h2>
                    <p className="text-gray-600">Add, edit, or remove users from the system.</p>
                    <button className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                        Go to User Management
                    </button>
                </div>

                <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
                    <h2 className="text-xl font-semibold">Event Management</h2>
                    <p className="text-gray-600">Create, update, or delete events.</p>
                    <button className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                        Go to Event Management
                    </button>
                </div>

                <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
                    <h2 className="text-xl font-semibold">Reports</h2>
                    <p className="text-gray-600">View and generate reports on user activities.</p>
                    <button className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                        View Reports
                    </button>
                </div>

                {/* Add more control cards as needed */}
            </div>
        </div>
    );
};

export default AdminDashboard;
