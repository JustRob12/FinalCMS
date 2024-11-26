// src/components/Layout.jsx

import React from 'react';
import Header from '../Header';
import UserNavbar from './UserNavbar';

const UserLayout = ({ user, setUser, children }) => {
  const handleLogout = () => {
    localStorage.removeItem('user'); // Clear user from local storage
    setUser(null); // Clear user state
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} />
      <UserNavbar />
      
      {/* Main Content */}
      <main className="pt-16 md:ml-64">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default UserLayout;
