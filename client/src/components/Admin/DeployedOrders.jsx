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
      <h1 className="text-3xl font-bold text-center mb-6">All Notifications</h1>

      <div className="mb-4 text-center">
        <input
          type="text"
          placeholder="Search by Order Code"
          className="px-4 py-2 border rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="border px-4 py-2">Order Code</th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Total Price</th>
              <th className="border px-4 py-2">Items</th> {/* New column for items */}
              <th className="border px-4 py-2">Timer</th>
              <th className="border px-4 py-2">Actions</th> {/* New column for actions */}
            </tr>
          </thead>
          <tbody>
            {filteredNotifications.map((notification) => (
              <tr key={notification._id} className="hover:bg-gray-100">
                <td className="border px-4 py-2">{notification.orderCode}</td>
                <td className="border px-4 py-2">{notification.userId?.name || "N/A"}</td>
                <td className="border px-4 py-2">₱{notification.totalPrice.toFixed(2)}</td>
                <td className="border px-4 py-2">
                  <ul className="list-disc list-inside">
                    {notification.items.map((item, index) => (
                      <li key={index}>
                        {item.foodName} - Quantity: {item.quantity}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="border px-4 py-2">
                  {notification.timeLeft > 0 ? formatTime(notification.timeLeft) : "Expired"}
                </td>
                <td className="border px-4 py-2">
                  {notification.timeLeft <= 0 && (
                    <button
                      onClick={() => handleDelete(notification._id)}
                      className="text-red-500 hover:underline"
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
