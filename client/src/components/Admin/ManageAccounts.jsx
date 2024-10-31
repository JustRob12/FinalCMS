// src/components/ManageAccounts.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ManageAccounts = () => {
    const [accounts, setAccounts] = useState([]);

    // Fetch accounts data on component mount
    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/auth/accounts`);
                setAccounts(response.data);
            } catch (error) {
                console.error("Error fetching accounts data:", error);
            }
        };
        fetchAccounts();
    }, []);

    // Filter accounts by role
    const adminAccounts = accounts.filter(account => account.role === 'admin');
    const userAccounts = accounts.filter(account => account.role === 'user');

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-semibold mb-4 text-center">Manage Accounts</h1>

            {/* Admin Accounts Table */}
            <h2 className="text-xl font-semibold mb-2 text-center">Admin Accounts</h2>
            <div className="overflow-x-auto mb-6">
                <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="py-2 px-4 border-b">Name</th>
                            <th className="py-2 px-4 border-b">ID</th>
                            <th className="py-2 px-4 border-b">Course</th>
                            <th className="py-2 px-4 border-b">Year</th>
                            <th className="py-2 px-4 border-b">Username</th>
                        </tr>
                    </thead>
                    <tbody>
                        {adminAccounts.map((account) => (
                            <tr key={account.id} className="text-center border-b">
                                <td className="py-2 px-4">{account.name}</td>
                                <td className="py-2 px-4">{account.id}</td>
                                <td className="py-2 px-4">{account.course}</td>
                                <td className="py-2 px-4">{account.year}</td>
                                <td className="py-2 px-4">{account.username}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* User Accounts Table */}
            <h2 className="text-xl font-semibold mb-2 text-center">User Accounts</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="py-2 px-4 border-b">Name</th>
                            <th className="py-2 px-4 border-b">ID</th>
                            <th className="py-2 px-4 border-b">Course</th>
                            <th className="py-2 px-4 border-b">Year</th>
                            <th className="py-2 px-4 border-b">Username</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userAccounts.map((account) => (
                            <tr key={account.id} className="text-center border-b">
                                <td className="py-2 px-4">{account.name}</td>
                                <td className="py-2 px-4">{account.id}</td>
                                <td className="py-2 px-4">{account.course}</td>
                                <td className="py-2 px-4">{account.year}</td>
                                <td className="py-2 px-4">{account.username}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageAccounts;
