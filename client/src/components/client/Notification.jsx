import axios from "axios";
import React, { useEffect, useState } from "react";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch notifications for the logged-in user
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Token:", token);

        if (!token) throw new Error("No authentication token found.");

        const response = await axios.get(`${backendUrl}/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setNotifications(
          response.data.map((notification) => ({
            ...notification,
            timeLeft: Math.max(0, new Date(notification.timer) - new Date()),
          }))
        );
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [backendUrl]);

  // Set up countdown timer
  useEffect(() => {
    const intervalId = setInterval(() => {
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => {
          const timeLeft = Math.max(
            0,
            new Date(notification.timer) - new Date()
          );
          return { ...notification, timeLeft };
        })
      );
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Handle deletion of a notification
  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${backendUrl}/notifications/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications(notifications.filter((notification) => notification._id !== id));
    } catch (err) {
      console.error("Error deleting notification:", err);
      setError("Failed to delete notification.");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  // Convert milliseconds to minutes and seconds format
  const formatTime = (timeInMs) => {
    const totalMinutes = Math.floor(timeInMs / (1000 * 60));
    if (totalMinutes >= 20) return "Expired"; // Show "Expired" if 20 minutes have passed
    const minutes = totalMinutes % 60;
    const seconds = Math.floor((timeInMs / 1000) % 60);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Notifications</h1>

      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="border px-4 py-2">Order Code</th>
              <th className="border px-4 py-2">Total Price</th>
              <th className="border px-4 py-2">Items</th>
              <th className="border px-4 py-2">Timer</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((notification) => (
              <tr key={notification._id} className="hover:bg-gray-100">
                <td className="border px-4 py-2">{notification.orderCode}</td>
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
                  {formatTime(notification.timeLeft)}
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

export default Notification;
