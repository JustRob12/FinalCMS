// src/components/AdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUsers, FaShoppingCart, FaMoneyBillWave, FaExclamationTriangle } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    revenueMetrics: {
      total: 0,
      today: 0,
      thisWeek: 0,
      thisMonth: 0
    },
    historyMetrics: {
      total: 0,
      today: 0,
      thisWeek: 0,
      thisMonth: 0
    },
    recentActivity: {
      history: []
    },
    lowStock: {
      items: []
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();

    // Refresh data every 5 minutes
    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  // Add a function to fetch current day's data
  const fetchCurrentData = async () => {
    try {
      const [todayResponse, monthResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/reports/comprehensive?range=today`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/reports/comprehensive?range=month`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      setDashboardData({
        revenueMetrics: {
          ...monthResponse.data.revenueMetrics,
          today: todayResponse.data.revenueMetrics.today
        },
        historyMetrics: {
          ...monthResponse.data.historyMetrics,
          today: todayResponse.data.historyMetrics.today
        },
        recentActivity: todayResponse.data.recentActivity,
        lowStock: todayResponse.data.lowStock
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentData();
    const intervalId = setInterval(fetchCurrentData, 60000); // Refresh every minute
    return () => clearInterval(intervalId);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/reports/comprehensive?range=today`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Today's Revenue */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Today's Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ₱{(dashboardData?.revenueMetrics?.today || 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Total: ₱{(dashboardData?.revenueMetrics?.total || 0).toFixed(2)}
              </p>
            </div>
            <FaMoneyBillWave className="text-green-500 text-3xl" />
          </div>
        </div>

        {/* Today's Orders */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Today's Orders</p>
              <p className="text-2xl font-bold text-blue-600">
                {dashboardData?.historyMetrics?.today || 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Total: {dashboardData?.historyMetrics?.total || 0}
              </p>
            </div>
            <FaShoppingCart className="text-blue-500 text-3xl" />
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Monthly Revenue</p>
              <p className="text-2xl font-bold text-purple-600">
                ₱{(dashboardData?.revenueMetrics?.thisMonth || 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Avg Order: ₱{(dashboardData?.revenueMetrics?.averageOrderValue || 0).toFixed(2)}
              </p>
            </div>
            <FaMoneyBillWave className="text-purple-500 text-3xl" />
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Low Stock Items</p>
              <p className="text-2xl font-bold text-red-600">
                {dashboardData?.lowStock?.items?.length || 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Critical: {dashboardData?.lowStock?.items?.filter(item => item.quantity <= 10).length || 0}
              </p>
            </div>
            <FaExclamationTriangle className="text-red-500 text-3xl" />
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dashboardData?.recentActivity?.history?.slice(0, 5).map((order, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">{order?.orderCode}</td>
                  <td className="px-6 py-4">{order?.customerName}</td>
                  <td className="px-6 py-4">₱{(order?.total || 0).toFixed(2)}</td>
                  <td className="px-6 py-4">{order?.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Critical Stock Alerts */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Critical Stock Alerts</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dashboardData?.lowStock?.items
                ?.filter(item => item.quantity <= 10)
                ?.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4">{item?.name}</td>
                    <td className="px-6 py-4">{item?.category}</td>
                    <td className="px-6 py-4">{item?.quantity}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Critical
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
