// src/components/ManageAccounts.jsx

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaUserShield, FaUsers, FaEdit, FaTrash, FaSearch, FaTimes } from 'react-icons/fa';

const ManageAccounts = () => {
    const [accounts, setAccounts] = useState([]);
    const [message, setMessage] = useState('');
    const [editingAccount, setEditingAccount] = useState(null);
    const [formData, setFormData] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/auth/accounts`,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }
            );
            setAccounts(response.data);
        } catch (error) {
            showMessage('Error fetching accounts', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredAccounts = accounts.filter(account => 
        account.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.course?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const adminAccounts = filteredAccounts.filter(account => account.role === 'admin');
    const userAccounts = filteredAccounts.filter(account => account.role === 'user');

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(''), 3000);
    };

    const handleEdit = (account) => {
        setEditingAccount(account);
        setFormData(account);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async () => {
        try {
            await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/auth/accounts/${editingAccount._id}`,
                formData,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }
            );
            await fetchAccounts();
            showMessage('Account updated successfully');
            setEditingAccount(null);
        } catch (error) {
            showMessage('Error updating account', 'error');
        }
    };

    const handleDelete = async (accountId) => {
        if (!window.confirm('Are you sure you want to delete this account?')) return;
        
        try {
            await axios.delete(
                `${import.meta.env.VITE_BACKEND_URL}/auth/accounts/${accountId}`,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }
            );
            await fetchAccounts();
            showMessage('Account deleted successfully');
        } catch (error) {
            showMessage('Error deleting account', 'error');
        }
    };

    const AccountTable = ({ accounts, showEditButton = false }) => (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User Details
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Academic Info
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Username
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {accounts.map((account) => (
                            <tr key={account._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                {account.role === 'admin' ? <FaUserShield className="text-gray-500" /> : <FaUsers className="text-gray-500" />}
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{account.name}</div>
                                            <div className="text-sm text-gray-500">ID: {account._id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{account.course}</div>
                                    <div className="text-sm text-gray-500">Year {account.year}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {account.username}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        {showEditButton && (
                                            <button
                                                onClick={() => handleEdit(account)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                <FaEdit className="w-5 h-5" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(account._id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <FaTrash className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Manage Accounts</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Manage all user and admin accounts in the system
                    </p>
                </div>

                {message && (
                    <div className={`mb-4 p-4 rounded-md ${
                        message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                    }`}>
                        {message.text}
                    </div>
                )}

                <div className="mb-6">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search accounts..."
                            className="pl-10 pr-4 py-2 w-full md:w-64 rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            <FaUserShield className="inline-block mr-2" />
                            Admin Accounts ({adminAccounts.length})
                        </h2>
                        <AccountTable accounts={adminAccounts} showEditButton={true} />
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            <FaUsers className="inline-block mr-2" />
                            User Accounts ({userAccounts.length})
                        </h2>
                        <AccountTable accounts={userAccounts} />
                    </section>
                </div>
            </div>

            {/* Edit Modal */}
            {editingAccount && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Edit Account</h2>
                            <button
                                onClick={() => setEditingAccount(null)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <FaTimes className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Course</label>
                                <input
                                    type="text"
                                    name="course"
                                    value={formData.course || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Year</label>
                                <input
                                    type="number"
                                    name="year"
                                    value={formData.year || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <button
                                    onClick={handleUpdate}
                                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => setEditingAccount(null)}
                                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageAccounts;