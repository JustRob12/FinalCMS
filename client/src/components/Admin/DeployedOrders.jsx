import axios from "axios";
import React, { useEffect, useState } from "react";

const DeployedOrders = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch all notifications from the backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found.");

        const response = await axios.get(`${backendUrl}/notifications/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setNotifications(response.data);
        setFilteredNotifications(response.data); // Initialize filtered notifications
        setLoading(false);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to load notifications.");
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [backendUrl]);

  // Filter notifications based on search term
  useEffect(() => {
    const filtered = notifications.filter((notification) =>
      notification.orderCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredNotifications(filtered);
  }, [searchTerm, notifications]);

  // Set up countdown timer for each notification
  useEffect(() => {
    const intervalId = setInterval(() => {
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => {
          const now = new Date().getTime();
          const timerEnd = new Date(notification.timer).getTime();
          const timeLeft = Math.max(0, timerEnd - now);

          return {
            ...notification,
            timeLeft,
          };
        })
      );
    }, 1000);

    return () => clearInterval(intervalId);
  }, [notifications]);

  // Handle deletion of a notification
  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${backendUrl}/notifications/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Remove the deleted notification from state
      setNotifications(notifications.filter(notification => notification._id !== id));
      setFilteredNotifications(filteredNotifications.filter(notification => notification._id !== id));
    } catch (err) {
      console.error("Error deleting notification:", err);
      setError("Failed to delete notification.");
    }
  };

  const activateOrder = async (id) => {
    const token = localStorage.getItem("token");
    const notification = notifications.find(n => n._id === id); // Get the notification details

    if (!notification) {
      console.error("Notification not found:", id);
      return;
    }

    const { userId, items, totalPrice } = notification; // Assuming these are part of your notification object

    // Get the current date and time
    const activatedAt = new Date();

    try {
      await axios.patch(`${backendUrl}/notifications/${id}/received`, { 
        userId, 
        items, 
        totalPrice, 
        activatedAt  // Include the activated date
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Order has been marked as received.");
      setNotifications(notifications.filter(notification => notification._id !== id));
    } catch (err) {
      console.error("Error activating order:", err);
      setError("Failed to activate order.");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  // Convert milliseconds to minutes and seconds format
  const formatTime = (timeInMs) => {
    const minutes = Math.floor((timeInMs / (1000 * 60)) % 60);
    const seconds = Math.floor((timeInMs / 1000) % 60);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Deployed Orders</h1>

      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search by Order Code"
          className="px-4 py-2 border rounded-md w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="text-sm text-gray-600">
          Total Orders: {filteredNotifications.length}
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <tr key={notification._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {notification.orderCode}
                  </div>
                  <div className="text-sm text-green-600">
                    ₱{notification.totalPrice.toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{notification.userId?.name}</div>
                  <div className="text-sm text-gray-500">
                    {notification.userId?.course} - Year {notification.userId?.year}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <ul className="text-sm text-gray-500 space-y-1">
                    {notification.items.map((item, index) => (
                      <li key={index} className="flex justify-between">
                        <span>{item.foodName}</span>
                        <span className="text-gray-400 ml-2">x{item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-sm rounded-full ${
                    notification.timeLeft > 300000 // 5 minutes in milliseconds
                      ? 'bg-green-100 text-green-800'
                      : notification.timeLeft > 0
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {notification.timeLeft > 0 ? formatTime(notification.timeLeft) : "Expired"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {notification.timeLeft > 0 ? (
                    <button
                      onClick={() => activateOrder(notification._id)}
                      className="text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded-md transition-colors"
                    >
                      Activate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDelete(notification._id)}
                      className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeployedOrders;
