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
        console.log("Token:", token); // Log the token

        if (!token) throw new Error("No authentication token found.");

        const response = await axios.get(`${backendUrl}/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`, // Ensure proper format
          },
        });

        setNotifications(response.data);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [backendUrl]);

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
    } catch (err) {
      console.error("Error deleting notification:", err);
      setError("Failed to delete notification.");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Notifications</h1>
      <ul className="list-disc list-inside">
        {notifications.map((notification) => {
          const isExpired = new Date(notification.timer) < new Date();
          return (
            <li key={notification._id} className="border-b py-2">
              <p><strong>Order Code:</strong> {notification.orderCode}</p>
              <p><strong>Total Price:</strong> ₱{notification.totalPrice.toFixed(2)}</p>
              <p><strong>Date:</strong> {new Date(notification.createdAt).toLocaleString()}</p>
              <p><strong>Timer:</strong> {Math.ceil((new Date(notification.timer) - new Date()) / (1000 * 60))} minutes remaining</p>
              <div>
                <strong>Items:</strong>
                <ul className="list-disc list-inside ml-5">
                  {notification.items.map((item, index) => (
                    <li key={index}>
                      {item.foodName} - Quantity: {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
              {isExpired && (
                <button
                  onClick={() => handleDelete(notification._id)}
                  className="mt-2 text-red-500 hover:underline"
                >
                  Delete
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Notification;
