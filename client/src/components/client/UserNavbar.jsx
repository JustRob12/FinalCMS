import axios from "axios";
import React, { useEffect, useState } from "react";
import { AiOutlineMenu } from "react-icons/ai"; // Menu icon
import { FaUtensils } from "react-icons/fa"; // Food icon
import { MdHistory, MdNotifications, MdShoppingCart } from "react-icons/md"; // Other icons
import { Link } from "react-router-dom"; // Import Link from react-router-dom

const UserNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("menu"); // Track active link
  const [cartCount, setCartCount] = useState(0); // Track cart item count

  const token = localStorage.getItem("token"); // Retrieve user token

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/cart`,
          {
            headers: { Authorization: token },
          }
        );
        const totalItems = response.data.foodItems.reduce(
          (acc, item) => acc + item.quantity,
          0
        );
        setCartCount(totalItems);
      } catch (error) {
        console.error("Error fetching cart count:", error);
      }
    };

    fetchCartCount();
  }, []); // Fetch cart count on component mount

  const toggleNavbar = () => {
    setIsOpen((prev) => !prev);
  };

  const handleLinkClick = (link) => {
    setActiveLink(link); // Update active link state
    setIsOpen(false); // Optional: Close navbar on link click (for mobile)
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
          isOpen ? "translate-y-0" : "translate-y-full"
        } md:static md:translate-y-0`}
      >
        <ul className="flex flex-col md:flex-row md:space-x-4">
          <li className="p-2">
            <Link
              to="/menu"
              onClick={() => handleLinkClick("menu")}
              className={`flex items-center ${
                activeLink === "menu"
                  ? "text-indigo-600"
                  : "text-gray-800 hover:text-indigo-600"
              }`}
            >
              <FaUtensils className="w-6 h-6 mr-2" />
              Menu
            </Link>
          </li>
          <li className="p-2 relative">
            <Link
              to="/cart"
              onClick={() => handleLinkClick("cart")}
              className={`flex items-center ${
                activeLink === "cart"
                  ? "text-indigo-600"
                  : "text-gray-800 hover:text-indigo-600"
              }`}
            >
              <MdShoppingCart className="w-6 h-6 mr-2" />
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          </li>
          <li className="p-2">
            <Link
              to="/notification"
              onClick={() => handleLinkClick("notification")}
              className={`flex items-center ${
                activeLink === "notification"
                  ? "text-indigo-600"
                  : "text-gray-800 hover:text-indigo-600"
              }`}
            >
              <MdNotifications className="w-6 h-6 mr-2" />
              Notification
            </Link>
          </li>
          <li className="p-2">
            <Link
              to="/history"
              onClick={() => handleLinkClick("history")}
              className={`flex items-center ${
                activeLink === "history"
                  ? "text-indigo-600"
                  : "text-gray-800 hover:text-indigo-600"
              }`}
            >
              <MdHistory className="w-6 h-6 mr-2" />
              History
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default UserNavbar;
