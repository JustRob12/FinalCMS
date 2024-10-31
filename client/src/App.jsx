import React, { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AddFood from './components/Admin/AddFood';
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminLayout from './components/Admin/AdminLayout';
import DeployedOrders from './components/Admin/DeployedOrders';
import HistoryAdmin from './components/Admin/HistoryAdmin'; // Import HistoryAdmin component
import ManageAccounts from './components/Admin/ManageAccounts';
import Orders from './components/Admin/Orders';
import Reports from './components/Admin/Reports';
import Home from './components/HomePage';
import Login from './components/Login';
import Signup from './components/Signup';
import Cart from './components/client/Cart';
import History from './components/client/History';
import Menu from './components/client/Menu';
import Notification from './components/client/Notification';
import UserDashboard from './components/client/UserDashboard';
import UserLayout from './components/client/UserLayout';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const renderAdminLayout = (children) => (
    user?.role === 'admin' ? (
      <AdminLayout user={user} setUser={setUser}>
        {children}
      </AdminLayout>
    ) : (
      <Login setUser={setUser} />
    )
  );

  const renderUserLayout = (children) => (
    user?.role === 'user' ? (
      <UserLayout user={user} setUser={setUser}>
        {children}
      </UserLayout>
    ) : (
      <Login setUser={setUser} />
    )
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home setUser={setUser} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/user-dashboard"
          element={renderUserLayout(<UserDashboard />)}
        />
        <Route
          path="/admin-dashboard"
          element={renderAdminLayout(<AdminDashboard />)}
        />
        <Route
          path="/add-food"
          element={renderAdminLayout(<AddFood />)}
        />
        <Route
          path="/orders"
          element={renderAdminLayout(<Orders />)}
        />
        <Route
          path="/reports"
          element={renderAdminLayout(<Reports />)}
        />
        <Route
          path="/manage-accounts"
          element={renderAdminLayout(<ManageAccounts />)}
        />
        <Route
          path="/deployed-orders"
          element={renderAdminLayout(<DeployedOrders />)}
        />
        <Route
          path="/history-admin" // New route for HistoryAdmin
          element={renderAdminLayout(<HistoryAdmin />)}
        />
        
        {/* New routes for user components */}
        <Route
          path="/menu"
          element={renderUserLayout(<Menu />)}
        />
        <Route
          path="/cart"
          element={renderUserLayout(<Cart />)}
        />
        <Route
          path="/notification"
          element={renderUserLayout(<Notification />)}
        />
        <Route
          path="/history"
          element={renderUserLayout(<History />)}
        />
      </Routes>
    </Router>
  );
};

export default App;
