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

  const exportToExcel = () => {
    if (!reportData) return;

    // Prepare sales data
    const salesData = [
      ['Period', 'Revenue', 'Orders'],
      ['Today', reportData.revenueMetrics.today, reportData.orderMetrics.today],
      ['This Week', reportData.revenueMetrics.thisWeek, reportData.orderMetrics.thisWeek],
      ['This Month', reportData.revenueMetrics.thisMonth, reportData.orderMetrics.thisMonth]
    ];

    // Prepare top selling items
    const topSellingData = reportData.foodMetrics.topSelling.map(item => [
      item._id,
      item.totalQuantity,
      item.totalRevenue
    ]);

    // Create workbook with multiple sheets
    const wb = XLSXUtils.book_new();
    
    // Add sales summary sheet
    const ws_sales = XLSXUtils.aoa_to_sheet(salesData);
    XLSXUtils.book_append_sheet(wb, ws_sales, 'Sales Summary');

    // Add top selling items sheet
    const ws_top = XLSXUtils.aoa_to_sheet([
      ['Item', 'Quantity Sold', 'Revenue'],
      ...topSellingData
    ]);
    XLSXUtils.book_append_sheet(wb, ws_top, 'Top Selling Items');

    // Generate Excel file
    const excelBuffer = XLSXWrite(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sales_Report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    link.click();
  };

  const exportToPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Sales Report', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 105, 25, { align: 'center' });

    // Add revenue summary
    doc.autoTable({
      startY: 35,
      head: [['Period', 'Revenue', 'Orders']],
      body: [
        ['Today', `₱${reportData.revenueMetrics.today.toFixed(2)}`, reportData.orderMetrics.today],
        ['This Week', `₱${reportData.revenueMetrics.thisWeek.toFixed(2)}`, reportData.orderMetrics.thisWeek],
        ['This Month', `₱${reportData.revenueMetrics.thisMonth.toFixed(2)}`, reportData.orderMetrics.thisMonth]
      ],
      theme: 'grid'
    });

    // Add top selling items
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 15,
      head: [['Item', 'Quantity Sold', 'Revenue']],
      body: reportData.foodMetrics.topSelling.map(item => [
        item._id,
        item.totalQuantity,
        `₱${item.totalRevenue.toFixed(2)}`
      ]),
      theme: 'grid'
    });

    // Save PDF
    doc.save(`Sales_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
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
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Revenue Trends</h2>
          <Line data={chartData} options={revenueChartOptions} />
        </div>

        {/* Orders Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Order Trends</h2>
          <Bar data={orderChartData} options={ordersChartOptions} />
        </div>
      </div>
    );
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
      {renderCharts()}

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

      {/* Recent History Table */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData?.recentActivity?.history?.map((entry, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{entry?.orderCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{entry?.customerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{entry?.course}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{entry?.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₱{(entry?.total || 0).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <ul className="list-disc list-inside">
                      {entry?.items?.map((item, idx) => (
                        <li key={idx}>
                          {item?.foodName} x {item?.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{entry?.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
