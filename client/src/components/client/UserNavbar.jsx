import axios from "axios";
import React, { useEffect, useState } from "react";
import { AiOutlineMenu } from "react-icons/ai"; // Menu icon
import { FaUtensils } from "react-icons/fa"; // Food icon
import { MdHistory, MdNotifications, MdShoppingCart } from "react-icons/md"; // Other icons
import { Link } from "react-router-dom"; // Import Link from react-router-dom

const UserNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("menu"); // Track active link
  const [cartCount, setCartCount] = useState(0); // Track cart item count
  const [notificationCount, setNotificationCount] = useState(0);

  const token = localStorage.getItem("token"); // Retrieve user token
  const bearerToken = token ? `Bearer ${token}` : null;

  useEffect(() => {
    const fetchCartCount = async () => {
      if (!bearerToken) {
        console.log("No token found");
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/cart`,
          {
            headers: { 
              Authorization: bearerToken,
              'Content-Type': 'application/json'
            },
          }
        );

        if (response.data && response.data.foodItems) {
          const totalItems = response.data.foodItems.reduce(
            (acc, item) => acc + item.quantity,
            0
          );
          setCartCount(totalItems);
        }
      } catch (error) {
        console.error("Error fetching cart count:", error.response?.data || error.message);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
        }
      }
    };

    fetchCartCount();
    const interval = setInterval(fetchCartCount, 30000);

    return () => clearInterval(interval);
  }, [bearerToken]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLinkClick = (link) => {
    setActiveLink(link); // Update active link state
    setIsMobileMenuOpen(false); // Optional: Close navbar on link click (for mobile)
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden fixed top-20 right-4 z-50 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
      >
        <AiOutlineMenu className="w-6 h-6" />
      </button>

      {/* Mobile Navigation Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={toggleMobileMenu}
      />

      {/* Mobile Navigation Menu */}
      <nav
        className={`md:hidden fixed right-0 top-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 bg-indigo-600">
          <h2 className="text-white text-lg font-bold">Menu</h2>
        </div>
        <ul className="p-4 space-y-2">
          <NavItem
            to="/menu"
            icon={<FaUtensils className="w-5 h-5" />}
            label="Menu"
            active={activeLink === "menu"}
            onClick={() => handleLinkClick("menu")}
            desktop
          />
          <NavItem
            to="/cart"
            icon={<MdShoppingCart className="w-5 h-5" />}
            label="Cart"
            active={activeLink === "cart"}
            onClick={() => handleLinkClick("cart")}
            badge={cartCount}
            desktop
          />
          <NavItem
            to="/notification"
            icon={<MdNotifications className="w-5 h-5" />}
            label="Notifications"
            active={activeLink === "notification"}
            onClick={() => handleLinkClick("notification")}
            badge={notificationCount}
            desktop
          />
          <NavItem
            to="/history"
            icon={<MdHistory className="w-5 h-5" />}
            label="History"
            active={activeLink === "history"}
            onClick={() => handleLinkClick("history")}
            desktop
          />
        </ul>
      </nav>

      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed left-0 top-16 h-full w-64 bg-white border-r shadow-sm">
        <ul className="p-4 space-y-2">
          <NavItem
            to="/menu"
            icon={<FaUtensils className="w-5 h-5" />}
            label="Menu"
            active={activeLink === "menu"}
            onClick={() => handleLinkClick("menu")}
            desktop
          />
          <NavItem
            to="/cart"
            icon={<MdShoppingCart className="w-5 h-5" />}
            label="Cart"
            active={activeLink === "cart"}
            onClick={() => handleLinkClick("cart")}
            badge={cartCount}
            desktop
          />
          <NavItem
            to="/notification"
            icon={<MdNotifications className="w-5 h-5" />}
            label="Notifications"
            active={activeLink === "notification"}
            onClick={() => handleLinkClick("notification")}
            badge={notificationCount}
            desktop
          />
          <NavItem
            to="/history"
            icon={<MdHistory className="w-5 h-5" />}
            label="History"
            active={activeLink === "history"}
            onClick={() => handleLinkClick("history")}
            desktop
          />
        </ul>
      </nav>
    </>
  );
};

// NavItem Component
const NavItem = ({ to, icon, label, active, onClick, badge, desktop }) => {
  return (
    <li>
      <Link
        to={to}
        onClick={onClick}
        className={`
          flex items-center space-x-3 p-3 rounded-lg w-full
          ${active 
            ? 'text-indigo-600 bg-indigo-50' 
            : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'}
          transition-colors
        `}
      >
        <div className="relative">
          {icon}
          {badge > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {badge}
            </span>
          )}
        </div>
        <span className="text-sm font-medium">{label}</span>
      </Link>
    </li>
  );
};

export default UserNavbar;
