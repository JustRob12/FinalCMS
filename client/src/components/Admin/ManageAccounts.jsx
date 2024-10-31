// src/components/ManageAccounts.jsx

import axios from 'axios';
import React, { useEffect, useState } from 'react';

const ManageAccounts = () => {
    const [accounts, setAccounts] = useState([]);
    const [message, setMessage] = useState('');
    const [editingAccount, setEditingAccount] = useState(null); // Track the account being edited
    const [formData, setFormData] = useState({}); // Track form data for editing

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

    // Edit account handler
    const handleEdit = (account) => {
        setEditingAccount(account);
        setFormData(account); // Pre-fill the form with existing account data
    };

    // Update form data as user types
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Submit the updated account data
    const handleUpdate = async () => {
        try {
            await axios.put(`${import.meta.env.VITE_BACKEND_URL}/auth/accounts/${editingAccount.id}`, {
                name: formData.name,
                course: formData.course,
                year: formData.year,
            });
            setAccounts(accounts.map(account => (account.id === editingAccount.id ? { ...account, ...formData } : account)));
            setMessage('User successfully updated');
            setEditingAccount(null); // Close modal after update
            setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
        } catch (error) {
            console.error("Error updating account:", error);
        }
    };

    // Delete account handler
    const handleDelete = async (accountId) => {
        try {
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/auth/accounts/${accountId}`);
            setAccounts(accounts.filter(account => account.id !== accountId));
            setMessage('User successfully deleted');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error("Error deleting account:", error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-semibold mb-4 text-center">Manage Accounts</h1>

            {message && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-center">
                    {message}
                </div>
            )}

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
                            <th className="py-2 px-4 border-b">Actions</th>
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
                                <td className="py-2 px-4 space-x-2">
                                    <button 
                                        onClick={() => handleEdit(account)} 
                                        className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(account.id)} 
                                        className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </td>
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
                            <th className="py-2 px-4 border-b">Actions</th>
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
                                <td className="py-2 px-4">
                                    <button 
                                        onClick={() => handleDelete(account.id)} 
                                        className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {editingAccount && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
                        <h2 className="text-xl font-semibold mb-4">Edit Account</h2>
                        <div className="space-y-4">
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded"
                                placeholder="Name"
                            />
                            <input
                                type="text"
                                name="course"
                                value={formData.course}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded"
                                placeholder="Course"
                            />
                            <input
                                type="number"
                                name="year"
                                value={formData.year}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded"
                                placeholder="Year"
                            />
                            <button
                                onClick={handleUpdate}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
                            >
                                Save Changes
                            </button>
                            <button
                                onClick={() => setEditingAccount(null)}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 w-full mt-2"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageAccounts;