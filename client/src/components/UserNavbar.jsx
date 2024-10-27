// src/components/UserNavbar.jsx

import React, { useState } from 'react';
import { AiOutlineMenu } from 'react-icons/ai'; // Menu icon
import { FaUtensils } from 'react-icons/fa'; // Food icon
import { MdHistory, MdNotifications, MdShoppingCart } from 'react-icons/md'; // Other icons

const UserNavbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleNavbar = () => {
        setIsOpen((prev) => !prev);
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
                    isOpen ? 'transform translate-y-0' : 'transform translate-y-full'
                } md:static md:translate-y-0 md:flex-row`}
            >
                <ul className="flex flex-col md:flex-row md:space-x-4">
                    <li className="p-2">
                        <a href="#menu" className="flex items-center text-gray-800 hover:text-indigo-600">
                            <FaUtensils className="w-6 h-6 mr-2" />
                            Menu
                        </a>
                    </li>
                    <li className="p-2">
                        <a href="#cart" className="flex items-center text-gray-800 hover:text-indigo-600">
                            <MdShoppingCart className="w-6 h-6 mr-2" />
                            Cart
                        </a>
                    </li>
                    <li className="p-2">
                        <a href="#notification" className="flex items-center text-gray-800 hover:text-indigo-600">
                            <MdNotifications className="w-6 h-6 mr-2" />
                            Notification
                        </a>
                    </li>
                    <li className="p-2">
                        <a href="#history" className="flex items-center text-gray-800 hover:text-indigo-600">
                            <MdHistory className="w-6 h-6 mr-2" />
                            History
                        </a>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default UserNavbar;
