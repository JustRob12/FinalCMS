// src/components/ManageAccounts.jsx

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaUserShield, FaUsers, FaEdit, FaTrash, FaSearch, FaTimes, FaUserCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';

const ManageAccounts = () => {
    const [accounts, setAccounts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingAccount, setEditingAccount] = useState(null);
    const [formData, setFormData] = useState({});

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
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch accounts',
                confirmButtonColor: '#4F46E5'
            });
        } finally {
            setLoading(false);
        }
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
            setEditingAccount(null);
            
            Swal.fire({
                icon: 'success',
                title: 'Updated!',
                text: 'Account has been updated successfully',
                showConfirmButton: false,
                timer: 1500,
                position: 'top-end',
                toast: true
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to update account',
                confirmButtonColor: '#4F46E5'
            });
        }
    };

    const handleDelete = async (accountId, accountName) => {
        const result = await Swal.fire({
            title: 'Delete Account',
            text: `Are you sure you want to delete ${accountName}'s account?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(
                    `${import.meta.env.VITE_BACKEND_URL}/auth/accounts/${accountId}`,
                    {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    }
                );
                await fetchAccounts();
                
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Account has been deleted successfully',
                    showConfirmButton: false,
                    timer: 1500,
                    position: 'top-end',
                    toast: true
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to delete account',
                    confirmButtonColor: '#4F46E5'
                });
            }
        }
    };

    const filteredAccounts = accounts.filter(account => 
        account.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.course?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const AccountCard = ({ account, showEditButton }) => (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                            {account.role === 'admin' ? 
                                <FaUserShield className="text-indigo-600 text-xl" /> : 
                                <FaUserCircle className="text-indigo-600 text-xl" />
                            }
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
                            <p className="text-sm text-gray-500">{account.username}</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        {showEditButton && (
                            <button
                                onClick={() => handleEdit(account)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                                title="Edit Account"
                            >
                                <FaEdit className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            onClick={() => handleDelete(account._id, account.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Delete Account"
                        >
                            <FaTrash className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Course</p>
                            <p className="font-medium">{account.course || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Year</p>
                            <p className="font-medium">{account.year || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const EditModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Edit Account Details
                    </h2>
                    <button
                        onClick={() => setEditingAccount(null)}
                        className="text-gray-400 hover:text-gray-500 transition-colors"
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Course
                        </label>
                        <input
                            type="text"
                            name="course"
                            value={formData.course || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Year Level
                        </label>
                        <select
                            name="year"
                            value={formData.year || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Select Year</option>
                            <option value="1">1st Year</option>
                            <option value="2">2nd Year</option>
                            <option value="3">3rd Year</option>
                            <option value="4">4th Year</option>
                        </select>
                    </div>

                    <div className="flex space-x-3 pt-6">
                        <button
                            onClick={handleUpdate}
                            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                        >
                            Save Changes
                        </button>
                        <button
                            onClick={() => setEditingAccount(null)}
                            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    const adminAccounts = filteredAccounts.filter(account => account.role === 'admin');
    const userAccounts = filteredAccounts.filter(account => account.role === 'user');

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Account Management</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Manage and monitor all user accounts in the system
                    </p>
                </div>

                <div className="mb-6 flex justify-between items-center">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search accounts..."
                            className="pl-10 pr-4 py-2 w-full md:w-80 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex space-x-4">
                        <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                            <span className="text-sm text-gray-500">Total Admins:</span>
                            <span className="ml-2 font-semibold text-indigo-600">{adminAccounts.length}</span>
                        </div>
                        <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                            <span className="text-sm text-gray-500">Total Users:</span>
                            <span className="ml-2 font-semibold text-indigo-600">{userAccounts.length}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {adminAccounts.length > 0 && (
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <FaUserShield className="mr-2 text-indigo-600" />
                                Admin Accounts
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {adminAccounts.map(account => (
                                    <AccountCard 
                                        key={account._id} 
                                        account={account} 
                                        showEditButton={true}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {userAccounts.length > 0 && (
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <FaUsers className="mr-2 text-indigo-600" />
                                User Accounts
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {userAccounts.map(account => (
                                    <AccountCard 
                                        key={account._id} 
                                        account={account} 
                                        showEditButton={true}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {filteredAccounts.length === 0 && (
                        <div className="text-center py-12">
                            <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No accounts found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                No accounts match your search criteria
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {editingAccount && <EditModal />}
        </div>
    );
};

export default ManageAccounts;