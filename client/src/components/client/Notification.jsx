import axios from "axios";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaBell, FaTrash, FaClock } from 'react-icons/fa';

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
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
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load notifications.',
          confirmButtonColor: '#4F46E5'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [backendUrl]);

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

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Delete Notification',
        text: 'Are you sure you want to delete this notification?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        await axios.delete(`${backendUrl}/notifications/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setNotifications(notifications.filter((notification) => notification._id !== id));
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Notification has been deleted.',
          showConfirmButton: false,
          timer: 1500,
          position: 'top-end',
          toast: true
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete notification.',
        confirmButtonColor: '#4F46E5'
      });
    }
  };

  const formatTime = (timeInMs) => {
    const totalMinutes = Math.floor(timeInMs / (1000 * 60));
    if (totalMinutes >= 20) return "Expired";
    const minutes = totalMinutes % 60;
    const seconds = Math.floor((timeInMs / 1000) % 60);
    return `${minutes}m ${seconds}s`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <FaBell className="text-red-500 text-5xl mb-4" />
        <p className="text-xl font-semibold text-red-500">Error Loading Notifications</p>
        <p className="text-gray-600 mt-2">{error}</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <FaBell className="text-gray-400 text-5xl mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700">No Notifications</h2>
        <p className="text-gray-500 mt-2">You don't have any active orders at the moment.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <FaBell className="mr-3 text-indigo-500" />
          Your Orders
        </h1>
        <span className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium">
          {notifications.length} Active {notifications.length === 1 ? 'Order' : 'Orders'}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notifications.map((notification) => (
          <div 
            key={notification._id} 
            className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 
              ${notification.timeLeft > 300000 ? 'border-green-500' : 
                notification.timeLeft > 0 ? 'border-yellow-500' : 'border-red-500'}`}
          >
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {notification.orderCode}
                  </h3>
                  <p className="text-indigo-600 font-medium">
                    ₱{notification.totalPrice.toFixed(2)}
                  </p>
                </div>
                <div className={`flex items-center px-3 py-1 rounded-full text-sm
                  ${notification.timeLeft > 300000 ? 'bg-green-100 text-green-800' : 
                    notification.timeLeft > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                  <FaClock className="mr-1" />
                  {formatTime(notification.timeLeft)}
                </div>
              </div>

              <div className="space-y-2">
                {notification.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm text-gray-600 border-b border-gray-100 pb-2">
                    <span>{item.foodName}</span>
                    <span className="font-medium">x{item.quantity}</span>
                  </div>
                ))}
              </div>

              {notification.timeLeft <= 0 && (
                <button
                  onClick={() => handleDelete(notification._id)}
                  className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  <FaTrash className="mr-2" />
                  Remove Expired Order
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notification;
