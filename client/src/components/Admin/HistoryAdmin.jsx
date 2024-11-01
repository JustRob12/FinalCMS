import axios from "axios";
import React, { useEffect, useState } from "react";

const HistoryAdmin = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
    useEffect(() => {
      const fetchAllHistory = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("No authentication token found.");
  
          const response = await axios.get(`${backendUrl}/history`, {
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
  
      fetchAllHistory();
    }, [backendUrl]);
  
    if (loading) return <p className="text-center mt-10">Loading...</p>;
    if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;
  
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-6">All Order Histories</h1>
        {history.length === 0 ? (
          <p className="text-center mt-10">No order history available.</p>
        ) : (
          <table className="table-auto w-full border-collapse border border-gray-200">
            <thead>
              <tr>
                <th className="border px-4 py-2">Order Code</th>
                <th className="border px-4 py-2">Total Price</th>
                <th className="border px-4 py-2">Received Date</th>
                <th className="border px-4 py-2">Items</th>
                <th className="border px-4 py-2">User Name</th>
                <th className="border px-4 py-2">User Course</th>
                <th className="border px-4 py-2">User Year</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr key={entry._id}>
                  <td className="border px-4 py-2">{entry.orderCode}</td>
                  <td className="border px-4 py-2">₱{entry.totalPrice.toFixed(2)}</td>
                  <td className="border px-4 py-2">
                    {entry.formattedDate ? entry.formattedDate : "Invalid Date"}
                  </td>
                  <td className="border px-4 py-2">
                    <ul className="list-inside">
                      {entry.items.map((item, index) => (
                        <li key={index}>
                          {item.foodName} - Quantity: {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="border px-4 py-2">{entry.userName}</td>
                  <td className="border px-4 py-2">{entry.userCourse}</td>
                  <td className="border px-4 py-2">{entry.userYear}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };
  
  export default HistoryAdmin;
  