// src/components/Header.jsx

import React, { useState } from 'react';
import { AiOutlineUser } from 'react-icons/ai';
import { MdLogout } from 'react-icons/md';

const Header = ({ user, onLogout }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
    };

    return (
        <>
            {/* Fixed Header */}
            <header className="fixed top-0 left-0 right-0 bg-indigo-600 shadow-md z-50">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo/Title */}
                        <h1 className="text-xl font-bold text-white">Campus Bite</h1>

                        {/* User Profile */}
                        <div className="relative">
                            <button 
                                onClick={toggleDropdown} 
                                className="flex items-center space-x-2 text-white hover:bg-indigo-700 rounded-full py-2 px-3 transition-colors"
                            >
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                    <span className="text-indigo-600 font-semibold">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <span className="hidden md:block">{user?.name}</span>
                            </button>

                            {/* Dropdown Menu */}
                            {dropdownOpen && (
                                <>
                                    {/* Overlay to close dropdown */}
                                    <div 
                                        className="fixed inset-0 z-10"
                                        onClick={() => setDropdownOpen(false)}
                                    />
                                    
                                    {/* Dropdown Content */}
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-20">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                            <p className="text-xs text-gray-500">{user?.email}</p>
                                        </div>
                                        <button
                                            onClick={onLogout}
                                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <MdLogout className="w-4 h-4 mr-2" />
                                            Sign out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Spacer to prevent content from going under fixed header */}
            <div className="h-16" />
        </>
    );
};

export default Header;
