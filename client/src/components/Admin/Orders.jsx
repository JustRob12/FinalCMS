import axios from "axios";
import React, { useEffect, useState } from "react";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updated, setUpdated] = useState(false); // State to trigger a re-fetch

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
  }, [backendUrl, updated]); // Add 'updated' to trigger re-fetch

  const handleOrderReady = async (order) => {
    try {
      const token = localStorage.getItem("token");
  
      if (!token) throw new Error("No authentication token found.");
  
      const notificationData = {
        orderCode: order.orderCode,
        userId: order.userId._id,
        totalPrice: order.totalPrice,
        items: order.items.map(item => ({
          foodName: item.foodId?.name,
          quantity: item.quantity,
        })),
        createdAt: order.createdAt,
      };
  
      // Step 1: Send a notification with items, price, and date
      await axios.post(
        `${backendUrl}/notifications`,
        notificationData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
  
      // Step 2: Delete the order
      await axios.delete(`${backendUrl}/orders/${order._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      alert("Order marked as ready and deleted!");
  
      setUpdated(!updated); // Trigger re-fetch
    } catch (err) {
      console.error("Error marking order as ready:", err);
      alert("Failed to mark order as ready.");
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
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-100">
                <td className="border px-4 py-2">{order.orderCode}</td>
                <td className="border px-4 py-2">{order.userId?.name}</td>
                <td className="border px-4 py-2">₱{order.totalPrice.toFixed(2)}</td>
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
                    onClick={() => handleOrderReady(order)}
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
