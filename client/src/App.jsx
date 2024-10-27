// src/App.jsx

import React, { useEffect, useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AdminDashboard from "./components/AdminDashboard";
import Home from "./components/HomePage";
import Layout from "./components/Layout"; // Import the Layout component
import Login from "./components/Login";
import Signup from "./components/Signup"; // Import the Signup component
import UserDashboard from "./components/UserDashboard";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Parse the stored user info
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home setUser={setUser} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup />} /> {/* Signup route */}
        <Route
          path="/user-dashboard"
          element={
            user?.role === "user" ? (
              <Layout user={user} setUser={setUser}>
                <UserDashboard />
              </Layout>
            ) : (
              <Login setUser={setUser} />
            )
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            user?.role === "admin" ? (
              <Layout user={user} setUser={setUser}>
                <AdminDashboard />
              </Layout>
            ) : (
              <Login setUser={setUser} />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
