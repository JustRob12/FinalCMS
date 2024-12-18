import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { utils as XLSXUtils, write as XLSXWrite } from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import { FaFileExcel, FaFilePdf, FaChartBar, FaDownload } from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  const [reportData, setReportData] = useState({
    revenueMetrics: {
      total: 0,
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      averageOrderValue: 0
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
    },
    foodStock: {
      items: [],
      totalItems: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      categories: {
        Meals: 0,
        Snacks: 0,
        Drinks: 0,
        Materials: 0
      }
    },
    userMetrics: {
      regularUsers: 0,
      regularOrders: 0,
      regularRevenue: 0,
      facultyUsers: 0,
      facultyOrders: 0,
      facultyRevenue: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('today');

  // Add these new chart configurations
  const revenueChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Revenue Trends'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `₱${value}`
        }
      }
    }
  };

  const ordersChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Order Trends'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const stockChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Food Stock Levels'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Quantity'
        }
      }
    }
  };

  const fetchComprehensiveReport = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/reports/comprehensive?range=${dateRange}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
      setError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComprehensiveReport();
  }, [dateRange]);

  const getChartData = () => {
    const labels = [];
    const revenueData = [];
    const ordersData = [];

    switch(dateRange) {
      case 'today':
        // Hourly breakdown for today
        for(let i = 0; i < 24; i++) {
          labels.push(`${i}:00`);
          revenueData.push(reportData.revenueMetrics.hourly?.[i] || 0);
          ordersData.push(reportData.historyMetrics.hourly?.[i] || 0);
        }
        break;
      case 'week':
        // Daily breakdown for week
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        days.forEach((day, index) => {
          labels.push(day);
          revenueData.push(reportData.revenueMetrics.daily?.[index] || 0);
          ordersData.push(reportData.historyMetrics.daily?.[index] || 0);
        });
        break;
      case 'month':
        // Weekly breakdown for month
        for(let i = 1; i <= 4; i++) {
          labels.push(`Week ${i}`);
          revenueData.push(reportData.revenueMetrics.weekly?.[i-1] || 0);
          ordersData.push(reportData.historyMetrics.weekly?.[i-1] || 0);
        }
        break;
      case 'year':
        // Monthly breakdown for year
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        months.forEach((month, index) => {
          labels.push(month);
          revenueData.push(reportData.revenueMetrics.monthly?.[index] || 0);
          ordersData.push(reportData.historyMetrics.monthly?.[index] || 0);
        });
        break;
    }

    return {
      labels,
      revenueData,
      ordersData
    };
  };

  const renderRevenueChart = () => {
    const { labels, revenueData } = getChartData();
    
    const data = {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data: revenueData,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        }
      ]
    };

    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Revenue Trend</h2>
        <div className="h-64">
          <Bar
            options={{
              ...revenueChartOptions,
              maintainAspectRatio: false,
              scales: {
                ...revenueChartOptions.scales,
                y: {
                  ...revenueChartOptions.scales.y,
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
      </div>
    );
  };

  const renderOrdersChart = () => {
    const { labels, ordersData } = getChartData();
    
    const data = {
      labels,
      datasets: [
        {
          label: 'Orders',
          data: ordersData,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        }
      ]
    };

    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Orders Trend</h2>
        <div className="h-64">
          <Bar
            options={{
              ...ordersChartOptions,
              maintainAspectRatio: false,
            }}
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
    );
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch comprehensive report data
      const reportResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/reports/comprehensive?range=${dateRange}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Fetch food stock data
      const foodResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/food`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Process food stock data
      const foodItems = foodResponse.data;
      const foodStockData = {
        items: foodItems,
        totalItems: foodItems.length,
        lowStockCount: foodItems.filter(item => item.quantity > 0 && item.quantity <= 10).length,
        outOfStockCount: foodItems.filter(item => item.quantity === 0).length,
        categories: foodItems.reduce((acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + 1;
          return acc;
        }, {
          Meals: 0,
          Snacks: 0,
          Drinks: 0,
          Materials: 0
        })
      };

      setReportData({
        ...reportResponse.data,
        foodStock: foodStockData
      });
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const exportToExcel = () => {
    if (!reportData) return;

    // Prepare sales data with proper formatting
    const salesData = [
      ['Period', 'Revenue (₱)', 'Orders'],
      ['Today', Number(reportData.revenueMetrics.today).toFixed(2), reportData.historyMetrics.today],
      ['This Week', Number(reportData.revenueMetrics.thisWeek).toFixed(2), reportData.historyMetrics.thisWeek],
      ['This Month', Number(reportData.revenueMetrics.thisMonth).toFixed(2), reportData.historyMetrics.thisMonth],
      ['Total', Number(reportData.revenueMetrics.total).toFixed(2), reportData.historyMetrics.total]
    ];

    // Prepare user metrics data
    const userMetricsData = [
      ['User Type', 'Users Count', 'Orders', 'Revenue (₱)'],
      ['Regular Users', reportData.userMetrics.regularUsers, reportData.userMetrics.regularOrders, Number(reportData.userMetrics.regularRevenue).toFixed(2)],
      ['Faculty', reportData.userMetrics.facultyUsers, reportData.userMetrics.facultyOrders, Number(reportData.userMetrics.facultyRevenue).toFixed(2)]
    ];

    // Prepare recent activity data
    const activityData = [
      ['Date', 'Order Code', 'Customer', 'Total (₱)'],
      ...reportData.recentActivity.history.map(entry => [
        format(new Date(entry.date), 'yyyy-MM-dd HH:mm'),
        entry.orderCode,
        entry.userName,
        Number(entry.total).toFixed(2)
      ])
    ];

    // Create workbook
    const wb = XLSXUtils.book_new();
    
    // Add sales summary sheet
    const ws_sales = XLSXUtils.aoa_to_sheet(salesData);
    XLSXUtils.book_append_sheet(wb, ws_sales, 'Sales Summary');

    // Add user metrics sheet
    const ws_users = XLSXUtils.aoa_to_sheet(userMetricsData);
    XLSXUtils.book_append_sheet(wb, ws_users, 'User Metrics');

    // Add recent activity sheet
    const ws_activity = XLSXUtils.aoa_to_sheet(activityData);
    XLSXUtils.book_append_sheet(wb, ws_activity, 'Recent Activity');

    // Generate Excel file
    const excelBuffer = XLSXWrite(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sales_Report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    
    // Add title and header
    doc.setFontSize(20);
    doc.text('Campus Bite Sales Report', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 105, 25, { align: 'center' });

    // Add revenue summary
    doc.autoTable({
      startY: 35,
      head: [['Period', 'Revenue (₱)', 'Orders']],
      body: [
        ['Today', Number(reportData.revenueMetrics.today).toFixed(2), reportData.historyMetrics.today],
        ['This Week', Number(reportData.revenueMetrics.thisWeek).toFixed(2), reportData.historyMetrics.thisWeek],
        ['This Month', Number(reportData.revenueMetrics.thisMonth).toFixed(2), reportData.historyMetrics.thisMonth],
        ['Total', Number(reportData.revenueMetrics.total).toFixed(2), reportData.historyMetrics.total]
      ],
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] } // Indigo color
    });

    // Add user metrics
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 15,
      head: [['User Type', 'Users', 'Orders', 'Revenue (₱)']],
      body: [
        ['Regular Users', reportData.userMetrics.regularUsers, reportData.userMetrics.regularOrders, Number(reportData.userMetrics.regularRevenue).toFixed(2)],
        ['Faculty', reportData.userMetrics.facultyUsers, reportData.userMetrics.facultyOrders, Number(reportData.userMetrics.facultyRevenue).toFixed(2)]
      ],
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }
    });

    // Add recent activity
    if (reportData.recentActivity.history.length > 0) {
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 15,
        head: [['Date', 'Order Code', 'Customer', 'Total (₱)']],
        body: reportData.recentActivity.history.map(entry => [
          format(new Date(entry.date), 'yyyy-MM-dd HH:mm'),
          entry.orderCode,
          entry.userName,
          Number(entry.total).toFixed(2)
        ]),
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] }
      });
    }

    // Save PDF
    doc.save(`Campus_Bite_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  // Add this section after the Summary Cards and before the Recent History Table
  const renderCharts = () => {
    if (!reportData?.recentActivity?.history) return null;

    // Group data by date
    const groupedData = reportData.recentActivity.history.reduce((acc, entry) => {
      const date = entry.date.split(' ')[0]; // Get only the date part
      if (!acc[date]) {
        acc[date] = {
          revenue: 0,
          orders: 0
        };
      }
      acc[date].revenue += entry.total;
      acc[date].orders += 1;
      return acc;
    }, {});

    // Prepare data for charts
    const dates = Object.keys(groupedData).sort();
    const revenues = dates.map(date => groupedData[date].revenue);
    const orders = dates.map(date => groupedData[date].orders);

    const chartData = {
      labels: dates,
      datasets: [
        {
          label: 'Revenue',
          data: revenues,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          yAxisID: 'y'
        }
      ]
    };

    const orderChartData = {
      labels: dates,
      datasets: [
        {
          label: 'Number of Orders',
          data: orders,
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          borderColor: 'rgb(53, 162, 235)',
          borderWidth: 1
        }
      ]
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Line Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Revenue Trends</h2>
          <div className="h-64">
            <Line data={chartData} options={revenueChartOptions} />
          </div>
        </div>

        {/* Orders Bar Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Order Trends</h2>
          <div className="h-64">
            <Bar data={orderChartData} options={ordersChartOptions} />
          </div>
        </div>
      </div>
    );
  };

  const generateStockChart = () => {
    if (!reportData.foodStock?.items.length) return null;

    const categoryData = {
      labels: Object.keys(reportData.foodStock.categories),
      datasets: [
        {
          label: 'Items per Category',
          data: Object.values(reportData.foodStock.categories),
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)'
          ],
          borderWidth: 1,
        }
      ]
    };

    return <Bar options={stockChartOptions} data={categoryData} />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">History Reports</h1>
        <div className="flex gap-4">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaFileExcel /> Export to Excel
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <FaFilePdf /> Export to PDF
          </button>
        </div>
      </div>

      {/* Updated Date Range Selector */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow">
        <div className="flex gap-4">
          <button
            onClick={() => setDateRange('today')}
            className={`px-4 py-2 rounded-lg ${
              dateRange === 'today' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setDateRange('week')}
            className={`px-4 py-2 rounded-lg ${
              dateRange === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setDateRange('month')}
            className={`px-4 py-2 rounded-lg ${
              dateRange === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setDateRange('year')}
            className={`px-4 py-2 rounded-lg ${
              dateRange === 'year' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            This Year
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-600">
            ₱{(reportData?.revenueMetrics?.total || 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
          <p className="text-3xl font-bold text-blue-600">
            {reportData?.historyMetrics?.total || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Average Order Value</h3>
          <p className="text-3xl font-bold text-purple-600">
            ₱{(reportData?.revenueMetrics?.averageOrderValue || 0).toFixed(2)}
          </p>
        </div>

        {/* New cards for Users and Faculty */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-indigo-600">
            {reportData?.userMetrics?.regularUsers || 0}
          </p>
          <p className="text-sm text-gray-500 mt-2">Regular Students</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Faculty</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {reportData?.userMetrics?.facultyUsers || 0}
          </p>
          <p className="text-sm text-gray-500 mt-2">Faculty Members</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {renderRevenueChart()}
        {renderOrdersChart()}
      </div>

      {/* Food Stock Report Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-bold mb-4">Food & Materials Stock Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold">Total Items</h3>
            <p className="text-2xl">{reportData.foodStock?.totalItems || 0}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold">Low Stock Items</h3>
            <p className="text-2xl">{reportData.foodStock?.lowStockCount || 0}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold">Out of Stock</h3>
            <p className="text-2xl">{reportData.foodStock?.outOfStockCount || 0}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold">Categories</h3>
            <p className="text-2xl">{Object.keys(reportData.foodStock?.categories || {}).length}</p>
          </div>
        </div>
        
        <div className="mb-6">
          {generateStockChart()}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Item Name</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Current Stock</th>
                <th className="px-4 py-2 text-left">Price</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {reportData.foodStock?.items.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">{item.category}</td>
                  <td className="px-4 py-2">{item.quantity}</td>
                  <td className="px-4 py-2">₱{item.price.toFixed(2)}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      !item.available
                        ? 'bg-gray-100 text-gray-800'
                        : item.quantity === 0 
                        ? 'bg-red-100 text-red-800'
                        : item.quantity <= 10
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {!item.available 
                        ? 'Not Available'
                        : item.quantity === 0 
                        ? 'Out of Stock' 
                        : item.quantity <= 10 
                        ? 'Low Stock'
                        : 'In Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Section */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Low Stock Items</h2>
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
            {reportData?.lowStock?.items?.length || 0} items
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity Left
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData?.lowStock?.items?.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{item?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item?.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`${
                      item?.quantity <= 10 ? 'text-red-600' : 'text-yellow-600'
                    } font-medium`}>
                      {item?.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ₱{(item?.price || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item?.quantity <= 10 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item?.quantity <= 10 ? 'Critical' : 'Low Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add a new section for User Distribution */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">User Distribution</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders Made
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                    Regular Students
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {reportData?.userMetrics?.regularUsers || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {reportData?.userMetrics?.regularOrders || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ₱{(reportData?.userMetrics?.regularRevenue || 0).toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                    Faculty Members
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {reportData?.userMetrics?.facultyUsers || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {reportData?.userMetrics?.facultyOrders || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ₱{(reportData?.userMetrics?.facultyRevenue || 0).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
