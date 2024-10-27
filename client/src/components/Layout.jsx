// src/components/Layout.jsx

import React from 'react';
import Header from './Header';

const Layout = ({ user, setUser, children }) => {
  const handleLogout = () => {
    localStorage.removeItem('user'); // Clear user from local storage
    setUser(null); // Clear user state
  };

  return (
    <div>
      <Header user={user} onLogout={handleLogout} />
      <main>{children}</main>
    </div>
  );
};

export default Layout;
