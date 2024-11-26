import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaSpinner, FaCheck, FaExclamationCircle } from "react-icons/fa";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingOrders, setProcessingOrders] = useState(new Set());
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchOrders();
    // Set up polling every 30 seconds
    const intervalId = setInterval(fetchOrders, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found.");

      const response = await axios.get(`${backendUrl}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(response.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const handleOrderReady = async (order) => {
    if (processingOrders.has(order._id)) return;
    
    setProcessingOrders(prev => new Set([...prev, order._id]));

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found.");

      // Step 1: Decrement quantities
      await Promise.all(order.items.map(async (item) => {
        if (item.foodId?._id) {
          await axios.patch(
            `${backendUrl}/food/${item.foodId._id}/decrement-quantity`,
            { quantity: item.quantity },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }));

      // Step 2: Create notification
      const notificationData = {
        orderCode: order.orderCode,
        userId: order.userId._id,
        totalPrice: order.totalPrice,
        items: order.items.map(item => ({
          foodName: item.foodId?.name,
          quantity: item.quantity,
        })),
      };

      await axios.post(
        `${backendUrl}/notifications`,
        notificationData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Step 3: Delete order
      await axios.delete(`${backendUrl}/orders/${order._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Step 4: Update local state
      setOrders(prevOrders => prevOrders.filter(o => o._id !== order._id));

    } catch (err) {
      console.error("Error processing order:", err);
      alert("Failed to process order. Please try again.");
    } finally {
      setProcessingOrders(prev => {
        const next = new Set(prev);
        next.delete(order._id);
        return next;
      });
    }
  };

  // Sort orders to prioritize faculty orders
  const sortedOrders = orders.sort((a, b) => {
    // Faculty orders come first
    if (a.userId?.role === 'faculty' && b.userId?.role !== 'faculty') return -1;
    if (a.userId?.role !== 'faculty' && b.userId?.role === 'faculty') return 1;
    // Then sort by creation time
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  // Group orders by type
  const facultyOrders = sortedOrders.filter(order => order.userId?.role === 'faculty');
  const regularOrders = sortedOrders.filter(order => order.userId?.role !== 'faculty');

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Active Orders</h1>
          <div className="text-sm text-gray-600">
            Total Orders: {orders.length}
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <FaExclamationCircle className="inline mr-2" />
            {error}
          </div>
        )}

        {/* Faculty Orders Section */}
        {facultyOrders.length > 0 && (
          <>
            <h2 className="text-xl font-semibold text-yellow-600 mb-4 mt-6">
              Priority Orders (Faculty)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {facultyOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-yellow-50 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border-2 border-yellow-200"
                >
                  {/* Priority Badge */}
                  <div className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 text-center">
                    FACULTY PRIORITY
                  </div>
                  
                  {/* Rest of the order card content */}
                  <div className="p-4 border-b border-yellow-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-600">
                        Order Code:
                      </span>
                      <span className="text-sm font-bold text-blue-600">
                        {order.orderCode}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total:</span>
                      <span className="text-lg font-bold text-green-600">
                        ₱{order.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50">
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-600 mb-2">
                        Customer Details
                      </h3>
                      <p className="text-sm">{order.userId?.name}</p>
                      <p className="text-sm text-gray-600">
                        {order.userId?.course} - Year {order.userId?.year}
                      </p>
                    </div>

                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-600 mb-2">
                        Order Items
                      </h3>
                      <ul className="space-y-1">
                        {order.items.map((item, index) => (
                          <li key={index} className="text-sm flex justify-between">
                            <span>{item.foodId?.name}</span>
                            <span className="text-gray-600">x{item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-xs text-gray-500 mb-4">
                      Ordered at: {new Date(order.createdAt).toLocaleString()}
                    </div>

                    <button
                      onClick={() => handleOrderReady(order)}
                      disabled={processingOrders.has(order._id)}
                      className={`w-full py-2 px-4 rounded-md flex items-center justify-center gap-2 ${
                        processingOrders.has(order._id)
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-yellow-600 hover:bg-yellow-700'
                      } text-white transition-colors`}
                    >
                      {processingOrders.has(order._id) ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <FaCheck />
                          Order is Ready
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Regular Orders Section */}
        {regularOrders.length > 0 && (
          <>
            <h2 className="text-xl font-semibold text-gray-700 mb-4 mt-6">
              Regular Orders
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-600">
                        Order Code:
                      </span>
                      <span className="text-sm font-bold text-blue-600">
                        {order.orderCode}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total:</span>
                      <span className="text-lg font-bold text-green-600">
                        ₱{order.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50">
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-600 mb-2">
                        Customer Details
                      </h3>
                      <p className="text-sm">{order.userId?.name}</p>
                      <p className="text-sm text-gray-600">
                        {order.userId?.course} - Year {order.userId?.year}
                      </p>
                    </div>

                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-600 mb-2">
                        Order Items
                      </h3>
                      <ul className="space-y-1">
                        {order.items.map((item, index) => (
                          <li key={index} className="text-sm flex justify-between">
                            <span>{item.foodId?.name}</span>
                            <span className="text-gray-600">x{item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-xs text-gray-500 mb-4">
                      Ordered at: {new Date(order.createdAt).toLocaleString()}
                    </div>

                    <button
                      onClick={() => handleOrderReady(order)}
                      disabled={processingOrders.has(order._id)}
                      className={`w-full py-2 px-4 rounded-md flex items-center justify-center gap-2 ${
                        processingOrders.has(order._id)
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600'
                      } text-white transition-colors`}
                    >
                      {processingOrders.has(order._id) ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <FaCheck />
                          Order is Ready
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {orders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No active orders</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
