// src/components/Header.jsx

import React, { useState } from 'react';
import { AiOutlineUser } from 'react-icons/ai';

const Header = ({ user, onLogout }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
    };

    return (
        <header className="flex flex-col md:flex-row justify-between items-center p-4 bg-indigo-600 text-white">
            <h1 className="text-xl font-bold">Campus Bite</h1>
            <div className="relative mt-2 md:mt-0">
                <button onClick={toggleDropdown} className="flex items-center focus:outline-none">
                    <AiOutlineUser className="w-6 h-6" />
                    <span className="ml-2">{user?.name}</span>
                </button>
                {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg z-20">
                        <button
                            onClick={onLogout} // This triggers the logout
                            className="block px-4 py-2 text-left w-full hover:bg-indigo-600 hover:text-white"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
