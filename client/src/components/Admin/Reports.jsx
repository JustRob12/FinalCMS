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
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('week'); // week, month, year

  useEffect(() => {
    fetchComprehensiveReport();
  }, [dateRange]);

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
      setLoading(false);
    } catch (error) {
      console.error('Error fetching report:', error);
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sales Reports</h1>
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

      {/* Date Range Selector */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow">
        <div className="flex gap-4">
          <button
            onClick={() => setDateRange('week')}
            className={`px-4 py-2 rounded-lg ${dateRange === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            This Week
          </button>
          <button
            onClick={() => setDateRange('month')}
            className={`px-4 py-2 rounded-lg ${dateRange === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            This Month
          </button>
          <button
            onClick={() => setDateRange('year')}
            className={`px-4 py-2 rounded-lg ${dateRange === 'year' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            This Year
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-600">₱{reportData.revenueMetrics.total.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
          <p className="text-3xl font-bold text-blue-600">{reportData.orderMetrics.total}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Average Order Value</h3>
          <p className="text-3xl font-bold text-purple-600">
            ₱{reportData.revenueMetrics.averageOrderValue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Revenue Trend</h2>
          <Line
            data={{
              labels: ['Today', 'This Week', 'This Month'],
              datasets: [{
                label: 'Revenue (₱)',
                data: [
                  reportData.revenueMetrics.today,
                  reportData.revenueMetrics.thisWeek,
                  reportData.revenueMetrics.thisMonth
                ],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
              }]
            }}
          />
        </div>

        {/* Orders Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Orders Trend</h2>
          <Bar
            data={{
              labels: ['Today', 'This Week', 'This Month'],
              datasets: [{
                label: 'Number of Orders',
                data: [
                  reportData.orderMetrics.today,
                  reportData.orderMetrics.thisWeek,
                  reportData.orderMetrics.thisMonth
                ],
                backgroundColor: 'rgba(53, 162, 235, 0.5)'
              }]
            }}
          />
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
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
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.recentActivity.orders.map((order, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{order.orderCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.customerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₱{order.total.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.date}</td>
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
