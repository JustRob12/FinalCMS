import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch, FaCalendar, FaDownload } from "react-icons/fa";
import { format, parseISO } from 'date-fns';

const HistoryAdmin = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchAllHistory();
  }, [backendUrl]);

  const fetchAllHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found.");

      const response = await axios.get(`${backendUrl}/history/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setHistory(response.data);
    } catch (err) {
      console.error("Error fetching all history:", err);
      setError("Failed to load all history. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'yyyy-MM-dd');
    } catch {
      return '';
    }
  };

  const filteredHistory = history.filter((entry) => {
    const matchesSearch = 
      entry.orderCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.userCourse?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterDate) {
      const entryDate = formatDate(entry.createdAt);
      return matchesSearch && entryDate === filterDate;
    }

    return matchesSearch;
  });

  const formatDisplayDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid Date';
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ["Order Code", "Total Price", "Date", "Customer", "Course", "Year", "Items"],
      ...filteredHistory.map(entry => [
        entry.orderCode,
        entry.totalPrice,
        entry.formattedDate,
        entry.userName,
        entry.userCourse,
        entry.userYear,
        entry.items.map(item => `${item.foodName}(${item.quantity})`).join(", ")
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order_history_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-center bg-red-100 p-4 rounded-lg">
          <p className="font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Order History</h1>
        <p className="text-gray-600 mt-2">View and manage all order histories</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative flex-1 md:flex-none">
              <FaCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-48"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={exportToCSV}
            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600 transition-colors w-full md:w-auto justify-center"
          >
            <FaDownload /> Export to CSV
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHistory.map((entry) => (
                <tr key={entry._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{entry.orderCode}</div>
                    <div className="text-sm text-gray-500">
                      {formatDisplayDate(entry.createdAt)}
                    </div>
                    <div className="text-sm font-semibold text-green-600">₱{entry.totalPrice.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">Payment: ₱{entry.payment?.toFixed(2)}</div>
                      <div className="text-green-600">Change: ₱{entry.change?.toFixed(2)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{entry.userName}</div>
                    <div className="text-sm text-gray-500">{entry.userCourse}</div>
                    <div className="text-sm text-gray-500">Year {entry.userYear}</div>
                  </td>
                  <td className="px-6 py-4">
                    <ul className="text-sm text-gray-500 space-y-1">
                      {entry.items.map((item, index) => (
                        <li key={index} className="flex justify-between">
                          <span>{item.foodName}</span>
                          <span className="text-gray-400">x{item.quantity}</span>
                        </li>
                      ))}
                    </ul>
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

export default HistoryAdmin;