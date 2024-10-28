import axios from "axios";
import React, { useEffect, useState } from "react";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updated, setUpdated] = useState(false); // State to trigger a re-fetch after updating

  const backendUrl = import.meta.env.VITE_BACKEND_URL; // Accessing VITE_BACKEND_URL

  // Fetch all orders from the backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) throw new Error("No authentication token found.");

        const response = await axios.get(`${backendUrl}/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOrders(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders.");
        setLoading(false);
      }
    };

    fetchOrders();
  }, [backendUrl, updated]); // Add updated to re-fetch orders when it changes

  // Function to mark the order as ready
  const handleOrderReady = async (order) => {
    console.log('Attempting to mark order as ready:', order._id); // Log the orderId
    try {
      const token = localStorage.getItem("token");

      if (!token) throw new Error("No authentication token found.");

      // Create a notification with the order details
      await axios.post(`${backendUrl}/notifications`, { // No '/api' prefix needed here since it's already included in the router
        orderCode: order.orderCode,
        userId: order.userId._id, 
        totalPrice: order.totalPrice,
      }, {
        headers: {
            Authorization: `Bearer ${token}`,
          },
      });

      alert("Order marked as ready and notification sent!");
      setUpdated(!updated); // Toggle updated state to trigger re-fetch
    } catch (err) {
      if (err.response) {
        console.error("Error response from server:", err.response.data);
        alert("Failed to mark order as ready: " + err.response.data.message);
      } else {
        console.error("Error marking order as ready:", err);
        alert("Failed to mark order as ready.");
      }
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Orders</h1>

      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="border px-4 py-2">Order Code</th>
              <th className="border px-4 py-2">User ID</th>
              <th className="border px-4 py-2">Total Price</th>
              <th className="border px-4 py-2">Items</th>
              <th className="border px-4 py-2">Date</th>
              <th className="border px-4 py-2">Actions</th> {/* New Actions column */}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-100">
                <td className="border px-4 py-2">{order.orderCode}</td>
                <td className="border px-4 py-2">{order.userId?.name}</td>{" "}
                <td className="border px-4 py-2">
                  ₱{order.totalPrice.toFixed(2)}
                </td>
                <td className="border px-4 py-2">
                  <ul className="list-disc list-inside">
                    {order.items.map((item, index) => (
                      <li key={index}>
                        {item.foodId?.name} - {item.quantity}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="border px-4 py-2">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => handleOrderReady(order)} // Pass the entire order object
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Order is Ready
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
