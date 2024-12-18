// src/components/ManageAccounts.jsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaUserShield, FaUsers, FaEdit, FaTrash, FaSearch, FaTimes, FaUserCircle, FaFilter } from 'react-icons/fa';
import Swal from 'sweetalert2';

const ManageAccounts = () => {
    const [accounts, setAccounts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingAccount, setEditingAccount] = useState(null);
    const [formData, setFormData] = useState({ name: '' });
    const [filterRole, setFilterRole] = useState('all');

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
        setFormData({
            ...account,
            name: account.name || ''
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };
    
    const handleUpdate = async () => {
        try {
            if (!editingAccount?._id) {
                throw new Error('No account selected for editing');
            }

            const response = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/auth/accounts/${editingAccount._id}`,
                formData,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }
            );

            if (response.data) {
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
            }
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
                const response = await axios.delete(
                    `${import.meta.env.VITE_BACKEND_URL}/auth/accounts/${accountId}`,
                    {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    }
                );

                if (response.data.message) {
                    await fetchAccounts();
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: response.data.message,
                        showConfirmButton: false,
                        timer: 1500,
                        position: 'top-end',
                        toast: true
                    });
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.response?.data?.message || 'Failed to delete account',
                    confirmButtonColor: '#4F46E5'
                });
            }
        }
    };

    const filteredAccounts = accounts.filter(account => {
        const matchesSearch = 
            account.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.course?.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filterRole === 'all') return matchesSearch;
        return matchesSearch && account.role === filterRole;
    });

    const AccountCard = ({ account }) => (
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
            <div className="p-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                            account.role === 'admin' 
                                ? 'bg-indigo-100' 
                                : account.role === 'faculty'
                                ? 'bg-purple-100'
                                : 'bg-emerald-100'
                        }`}>
                            {account.role === 'admin' ? 
                                <FaUserShield className="text-indigo-600 text-xl" /> : 
                                account.role === 'faculty' ?
                                <FaUserCircle className="text-purple-600 text-xl" /> :
                                <FaUserCircle className="text-emerald-600 text-xl" />
                            }
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">{account.name}</h3>
                            <p className="text-sm text-gray-500">{account.username}</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                                account.role === 'admin' 
                                    ? 'bg-indigo-100 text-indigo-800' 
                                    : account.role === 'faculty'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-emerald-100 text-emerald-800'
                            }`}>
                                {account.role === 'admin' 
                                    ? 'Administrator' 
                                    : account.role === 'faculty'
                                    ? 'Faculty'
                                    : 'Student'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => handleEdit(account)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            title="Edit Account"
                        >
                            <FaEdit className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => handleDelete(account._id, account.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Delete Account"
                        >
                            <FaTrash className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    {account.role === 'faculty' ? (
                        <>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-gray-500 mb-1">Department</p>
                                <p className="font-medium text-gray-900">{account.course || 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-gray-500 mb-1">COOP ID</p>
                                <p className="font-medium text-gray-900">{account.gsisId || 'N/A'}</p>
                            </div>
                        </>
                    ) : account.role === 'user' ? (
                        <>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-gray-500 mb-1">Course</p>
                                <p className="font-medium text-gray-900">{account.course || 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-gray-500 mb-1">Year Level</p>
                                <p className="font-medium text-gray-900">
                                    {account.year ? `${account.year}${['st', 'nd', 'rd', 'th'][account.year - 1]} Year` : 'N/A'}
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="col-span-2 bg-gray-50 p-3 rounded-lg">
                            <p className="text-gray-500 mb-1">Role</p>
                            <p className="font-medium text-gray-900">System Administrator</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const EditModal = () => {
        const handleModalClick = (e) => {
            e.stopPropagation();
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={handleModalClick}>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Edit Account Details</h2>
                            <p className="text-sm text-gray-500 mt-1">Update account information</p>
                        </div>
                        <button
                            onClick={() => setEditingAccount(null)}
                            className="text-gray-400 hover:text-gray-500 transition-colors"
                        >
                            <FaTimes className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Enter full name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Course
                            </label>
                            <select
                                name="course"
                                value={formData.course || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="" disabled>Select Course</option>
                                {courseOptions.map((course, index) => (
                                    <option key={index} value={course}>{course}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Year Level
                            </label>
                            <select
                                name="year"
                                value={formData.year || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="" disabled>Select Year</option>
                                <option value="1">1st Year</option>
                                <option value="2">2nd Year</option>
                                <option value="3">3rd Year</option>
                                <option value="4">4th Year</option>
                            </select>
                        </div>

                        <div className="flex space-x-3 pt-6">
                            <button
                                onClick={handleUpdate}
                                className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                            >
                                Save Changes
                            </button>
                            <button
                                onClick={() => setEditingAccount(null)}
                                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Account Management</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Manage and monitor all user accounts in the system
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name, username, or course..."
                                    className="pl-10 pr-4 py-2.5 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <FaFilter className="text-gray-400" />
                                <select
                                    value={filterRole}
                                    onChange={(e) => setFilterRole(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="admin">Administrators</option>
                                    <option value="faculty">Faculty</option>
                                    <option value="user">Students</option>
                                </select>
                            </div>
                            
                            <div className="flex space-x-4">
                                <div className="bg-indigo-50 px-4 py-2 rounded-lg">
                                    <span className="text-sm text-gray-600">Total Accounts:</span>
                                    <span className="ml-2 font-semibold text-indigo-600">{accounts.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {filteredAccounts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAccounts.map(account => (
                            <AccountCard key={account._id} account={account} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                        <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No accounts found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            No accounts match your search criteria
                        </p>
                    </div>
                )}
            </div>
            {editingAccount && <EditModal />}
        </div>
    );
};

const courseOptions = [
    "Bachelor of Science in Nursing",
    "Bachelor of Elementary Education",
    "Bachelor of Early Childhood Education",
    "Bachelor of Special Needs Education",
    "Bachelor Physical Education",
    "Bachelor of Technology and Livelihood Education major in Home Economics",
    "Bachelor of Technology and Livelihood Education major in Industrial Arts",
    "Bachelor of Secondary Education major in Filipino",
    "Bachelor of Secondary Education major in English",
    "Bachelor of Secondary Education major in Mathematics",
    "Bachelor of Secondary Education major in Science",
    "Bachelor in Industrial Technology Management major in Automotive Technology",
    "Bachelor of Science in Civil Engineering",
    "Bachelor of Science in Information Technology",
    "Bachelor of Science in Mathematics",
    "Bachelor of Science in Mathematics with Research Statistics",
    "Bachelor of Science in Business Administration",
    "Bachelor of Science in Criminology",
    "Bachelor of Science in Hospitality Management",
    "Bachelor of Science in Agribusiness Management",
    "Bachelor of Science in Biology major in Animal Biology",
    "Bachelor of Science in Agriculture major in Animal Science",
    "Bachelor of Science in Agriculture major in Crop Science",
    "Bachelor of Science in Biology",
    "Bachelor of Science in Biology major in Ecology",
    "Bachelor of Science in Environmental Science",
    "Bachelor of Science in Development Communication",
    "Bachelor of Arts in Political Science",
    "Bachelor of Science in Psychology"
];

export default ManageAccounts;