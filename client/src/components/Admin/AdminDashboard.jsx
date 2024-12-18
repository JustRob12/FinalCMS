import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUsers, FaShoppingCart, FaMoneyBillWave, FaExclamationTriangle } from 'react-icons/fa';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    revenueMetrics: {
      total: 0,
      hourly: [],
      daily: [],
      weekly: [],
      monthly: [],
      averageOrderValue: 0
    },
    historyMetrics: {
      total: 0,
      hourly: [],
      daily: [],
      weekly: [],
      monthly: []
    },
    recentActivity: {
      history: []
    },
    lowStock: {
      items: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('today');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/reports/comprehensive?range=${dateRange}`,
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

  useEffect(() => {
    fetchDashboardData();
    // Refresh data every 5 minutes
    const intervalId = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [dateRange]);

  const getChartData = () => {
    const labels = [];
    const revenueData = [];
    const ordersData = [];

    switch(dateRange) {
      case 'today':
        for(let i = 0; i < 24; i++) {
          labels.push(`${i}:00`);
          revenueData.push(dashboardData.revenueMetrics.hourly?.[i] || 0);
          ordersData.push(dashboardData.historyMetrics.hourly?.[i] || 0);
        }
        break;
      case 'week':
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        days.forEach((day, index) => {
          labels.push(day);
          revenueData.push(dashboardData.revenueMetrics.daily?.[index] || 0);
          ordersData.push(dashboardData.historyMetrics.daily?.[index] || 0);
        });
        break;
      case 'month':
        for(let i = 1; i <= 4; i++) {
          labels.push(`Week ${i}`);
          revenueData.push(dashboardData.revenueMetrics.weekly?.[i-1] || 0);
          ordersData.push(dashboardData.historyMetrics.weekly?.[i-1] || 0);
        }
        break;
      case 'year':
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        months.forEach((month, index) => {
          labels.push(month);
          revenueData.push(dashboardData.revenueMetrics.monthly?.[index] || 0);
          ordersData.push(dashboardData.historyMetrics.monthly?.[index] || 0);
        });
        break;
    }

    return { labels, revenueData, ordersData };
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const { labels, revenueData, ordersData } = getChartData();

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        
        {/* Date Range Selector */}
        <div className="flex gap-4">
          <button
            onClick={() => setDateRange('today')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              dateRange === 'today' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setDateRange('week')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              dateRange === 'week' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setDateRange('month')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              dateRange === 'month' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setDateRange('year')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              dateRange === 'year' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
            }`}
          >
            This Year
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Revenue */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Revenue ({dateRange})</p>
              <p className="text-2xl font-bold text-green-600">
                ₱{(revenueData.reduce((a, b) => a + b, 0) || 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Total: ₱{(dashboardData?.revenueMetrics?.total || 0).toFixed(2)}
              </p>
            </div>
            <FaMoneyBillWave className="text-green-500 text-3xl" />
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Orders ({dateRange})</p>
              <p className="text-2xl font-bold text-blue-600">
                {ordersData.reduce((a, b) => a + b, 0) || 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Total: {dashboardData?.historyMetrics?.total || 0}
              </p>
            </div>
            <FaShoppingCart className="text-blue-500 text-3xl" />
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Avg. Order Value</p>
              <p className="text-2xl font-bold text-purple-600">
                ₱{(dashboardData?.revenueMetrics?.averageOrderValue || 0).toFixed(2)}
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Revenue Trend</h2>
          <Bar
            options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                y: {
                  ...chartOptions.scales.y,
                  ticks: {
                    callback: (value) => `₱${value}`
                  }
                }
              }
            }}
            data={{
              labels,
              datasets: [{
                label: 'Revenue',
                data: revenueData,
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                borderColor: 'rgb(34, 197, 94)',
                borderWidth: 1
              }]
            }}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Orders Trend</h2>
          <Bar
            options={chartOptions}
            data={{
              labels,
              datasets: [{
                label: 'Orders',
                data: ordersData,
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1
              }]
            }}
          />
        </div>
      </div>

      {/* Critical Stock Alerts */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Critical Stock Items</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dashboardData?.lowStock?.items?.map((item, index) => (
                <tr key={index} className={item.quantity <= 10 ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4">{item.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded ${
                      item.quantity <= 10 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4">{item.category}</td>
                  <td className="px-6 py-4">₱{item.price?.toFixed(2)}</td>
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
