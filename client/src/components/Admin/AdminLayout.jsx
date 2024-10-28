// src/components/Admin/AdminLayout.jsx

import React from 'react';
import Header from '../Header';
import AdminNavbar from './AdminNavbar';

const AdminLayout = ({ user, setUser, children }) => {
  const handleLogout = () => {
    localStorage.removeItem('user'); // Clear user from local storage
    setUser(null); // Clear user state
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} onLogout={handleLogout} />
      <AdminNavbar />
      <main className="flex-grow p-4 bg-gray-50">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
