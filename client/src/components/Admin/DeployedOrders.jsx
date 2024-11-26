import axios from "axios";
import React, { useEffect, useState } from "react";

// Move PaymentModal outside of DeployedOrders
const PaymentModal = ({ notification, onClose, onConfirm }) => {
  const [paymentInput, setPaymentInput] = useState('');
  const [error, setError] = useState('');

  const handlePaymentChange = (e) => {
    const value = e.target.value;
    setPaymentInput(value);
    setError('');
  };

  const handleSubmit = () => {
    const paymentAmount = parseFloat(paymentInput);
    if (isNaN(paymentAmount) || paymentAmount < notification.totalPrice) {
      setError('Payment must be greater than or equal to the total amount');
      return;
    }
    onConfirm(paymentAmount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Payment Details</h2>
        
        <div className="mb-4">
          <p className="text-gray-600">Order Code: {notification.orderCode}</p>
          <p className="text-gray-600 font-semibold">
            Total Amount: ₱{notification.totalPrice.toFixed(2)}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Amount
          </label>
          <input
            type="number"
            value={paymentInput}
            onChange={handlePaymentChange}
            className="w-full p-2 border rounded-md"
            placeholder="Enter amount"
            min={notification.totalPrice}
            step="0.01"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        {paymentInput && !isNaN(parseFloat(paymentInput)) && 
         parseFloat(paymentInput) >= notification.totalPrice && (
          <div className="mb-4 p-3 bg-green-50 rounded-md">
            <p className="text-green-700 font-medium">
              Change: ₱{(parseFloat(paymentInput) - notification.totalPrice).toFixed(2)}
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            disabled={!paymentInput || parseFloat(paymentInput) < notification.totalPrice}
          >
            Confirm Payment
          </button>
        </div>
      </div>
    </div>
  );
};

const DeployedOrders = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    notification: null
  });
  const [pausedNotifications, setPausedNotifications] = useState(new Set());
  const [timers, setTimers] = useState({});

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

  // Modified timer effect
  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date().getTime();
      
      setTimers(prevTimers => {
        const newTimers = {};
        let hasChanges = false;

        notifications.forEach(notification => {
          // Skip if notification is paused
          if (pausedNotifications.has(notification._id)) {
            newTimers[notification._id] = prevTimers[notification._id] || 0;
            return;
          }

          const timerEnd = new Date(notification.timer).getTime();
          const timeLeft = Math.max(0, timerEnd - now);
          
          if (timeLeft !== prevTimers[notification._id]) {
            hasChanges = true;
          }
          newTimers[notification._id] = timeLeft;
        });

        // Only update if there are actual changes
        return hasChanges ? newTimers : prevTimers;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [notifications, pausedNotifications]);

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

  const activateOrder = (id) => {
    const notification = notifications.find(n => n._id === id);
    setPausedNotifications(prev => new Set(prev).add(id));
    setPaymentModal({
      isOpen: true,
      notification
    });
  };

  const handlePaymentConfirm = async (paymentAmount) => {
    const notification = paymentModal.notification;
    const change = paymentAmount - notification.totalPrice;
    
    try {
      const token = localStorage.getItem("token");
      
      // First, update the notification status
      await axios.patch(
        `${backendUrl}/notifications/${notification._id}/activate`,
        {
          userId: notification.userId._id,
          items: notification.items,
          totalPrice: notification.totalPrice,
          payment: paymentAmount,
          change: change,
          activatedAt: new Date()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Calculate price per item based on totalPrice and quantities
      const totalQuantity = notification.items.reduce((sum, item) => sum + item.quantity, 0);
      const pricePerItem = notification.totalPrice / totalQuantity;

      // Then create history entry with calculated prices
      await axios.post(
        `${backendUrl}/history`,
        {
          orderCode: notification.orderCode,
          userId: notification.userId._id,
          items: notification.items.map(item => ({
            foodName: item.foodName,
            quantity: item.quantity,
            price: pricePerItem // Add calculated price per item
          })),
          totalPrice: notification.totalPrice,
          payment: paymentAmount,
          change: change,
          date: new Date()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Remove from paused set before removing from notifications
      setPausedNotifications(prev => {
        const next = new Set(prev);
        next.delete(notification._id);
        return next;
      });

      setNotifications(prev => prev.filter(n => n._id !== notification._id));
      setPaymentModal({ isOpen: false, notification: null });
      alert("Order has been processed successfully!");
    } catch (err) {
      console.error("Error processing order:", err);
      console.log("Error details:", err.response?.data);
      alert(err.response?.data?.message || "Failed to process order. Please try again.");
    }
  };

  // Render timer value
  const renderTimer = (notification) => {
    const timeLeft = timers[notification._id] || 0;
    return (
      <span className={`px-2 py-1 text-sm rounded-full ${
        timeLeft > 300000
          ? 'bg-green-100 text-green-800'
          : timeLeft > 0
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-red-100 text-red-800'
      }`}>
        {timeLeft > 0 ? formatTime(timeLeft) : "Expired"}
      </span>
    );
  };

  // Separate faculty and regular notifications
  const facultyNotifications = filteredNotifications.filter(
    notification => notification.userId?.role === 'faculty'
  );
  const regularNotifications = filteredNotifications.filter(
    notification => notification.userId?.role !== 'faculty'
  );

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

      {/* Faculty Orders Section */}
      {facultyNotifications.length > 0 && (
        <>
          <h2 className="text-xl font-semibold text-yellow-600 mb-4">Priority Orders (Faculty)</h2>
          <div className="overflow-x-auto bg-yellow-50 rounded-lg shadow mb-8 border-2 border-yellow-200">
            <table className="min-w-full divide-y divide-yellow-200">
              <thead className="bg-yellow-100">
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
              <tbody className="bg-yellow-50 divide-y divide-yellow-200">
                {facultyNotifications.map((notification) => (
                  <tr key={notification._id} className="hover:bg-yellow-100">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {notification.orderCode}
                        <span className="ml-2 px-2 py-1 text-xs bg-yellow-500 text-white rounded-full">
                          FACULTY
                        </span>
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
                      {renderTimer(notification)}
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
        </>
      )}

      {/* Regular Orders Section */}
      {regularNotifications.length > 0 && (
        <>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Regular Orders</h2>
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
                {regularNotifications.map((notification) => (
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
                      {renderTimer(notification)}
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
        </>
      )}

      {filteredNotifications.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">No orders found</p>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModal.isOpen && (
        <PaymentModal
          key={paymentModal.notification._id}
          notification={paymentModal.notification}
          onClose={() => {
            setPausedNotifications(prev => {
              const next = new Set(prev);
              next.delete(paymentModal.notification._id);
              return next;
            });
            setPaymentModal({ isOpen: false, notification: null });
          }}
          onConfirm={handlePaymentConfirm}
        />
      )}
    </div>
  );
};

export default DeployedOrders;
