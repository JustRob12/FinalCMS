// src/components/AdminNavbar.jsx

import React, { useState } from 'react';
import { AiOutlineMenu } from 'react-icons/ai'; // Menu icon for toggling
import {
    MdDashboard,
    MdFastfood,
    MdListAlt,
    MdManageAccounts,
    MdReport,
} from 'react-icons/md'; // Icons for options
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const AdminNavbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeLink, setActiveLink] = useState('dashboard'); // Track active link

    const toggleNavbar = () => {
        setIsOpen((prev) => !prev);
    };

    const handleLinkClick = (link) => {
        setActiveLink(link); // Update the active link state
        setIsOpen(false); // Optional: Close navbar after clicking (for mobile)
    };

    return (
        <div>
            {/* Mobile Menu Icon */}
            <button
                onClick={toggleNavbar}
                className="fixed bottom-4 right-4 bg-indigo-600 text-white p-3 rounded-full shadow-lg md:hidden z-50"
            >
                <AiOutlineMenu className="w-6 h-6" />
            </button>

            {/* Navbar Links */}
            <nav
                className={`bg-white shadow-md rounded-md transition-transform duration-300 md:flex md:items-center md:justify-between p-4 fixed bottom-0 left-0 right-0 ${
                    isOpen ? 'translate-y-0' : 'translate-y-full'
                } md:static md:translate-y-0`}
            >
                <ul className="flex flex-col md:flex-row md:space-x-4">
                    <li className="p-2">
                        <Link
                            to="/admin-dashboard"
                            onClick={() => handleLinkClick('dashboard')}
                            className={`flex items-center ${
                                activeLink === 'dashboard'
                                    ? 'text-indigo-600'
                                    : 'text-gray-800 hover:text-indigo-600'
                            }`}
                        >
                            <MdDashboard className="w-6 h-6 mr-2" />
                            Dashboard
                        </Link>
                    </li>

                    <li className="p-2">
                        <Link
                            to="/add-food"
                            onClick={() => handleLinkClick('add-foods')}
                            className={`flex items-center ${
                                activeLink === 'add-foods'
                                    ? 'text-indigo-600'
                                    : 'text-gray-800 hover:text-indigo-600'
                            }`}
                        >
                            <MdFastfood className="w-6 h-6 mr-2" />
                            Add Foods
                        </Link>
                    </li>

                    <li className="p-2">
                        <Link
                            to="/orders"
                            onClick={() => handleLinkClick('orders')}
                            className={`flex items-center ${
                                activeLink === 'orders'
                                    ? 'text-indigo-600'
                                    : 'text-gray-800 hover:text-indigo-600'
                            }`}
                        >
                            <MdListAlt className="w-6 h-6 mr-2" />
                            Orders
                        </Link>
                    </li>

                    <li className="p-2">
                        <Link
                            to="/reports"
                            onClick={() => handleLinkClick('reports')}
                            className={`flex items-center ${
                                activeLink === 'reports'
                                    ? 'text-indigo-600'
                                    : 'text-gray-800 hover:text-indigo-600'
                            }`}
                        >
                            <MdReport className="w-6 h-6 mr-2" />
                            Reports
                        </Link>
                    </li>

                    <li className="p-2">
                        <Link
                            to="/manage-accounts"
                            onClick={() => handleLinkClick('manage-accounts')}
                            className={`flex items-center ${
                                activeLink === 'manage-accounts'
                                    ? 'text-indigo-600'
                                    : 'text-gray-800 hover:text-indigo-600'
                            }`}
                        >
                            <MdManageAccounts className="w-6 h-6 mr-2" />
                            Manage Accounts
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default AdminNavbar;