import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaReceipt, FaTimes } from "react-icons/fa";

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found.");

        const response = await axios.get(
          `${backendUrl}/history/user`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setHistory(response.data);
      } catch (err) {
        console.error("Error fetching history:", err);
        setError(
          err.response?.data?.message || "Failed to load history. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [backendUrl]);

  // Receipt Modal Component
  const ReceiptModal = ({ receipt, onClose }) => {
    if (!receipt) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Receipt</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FaTimes size={20} />
            </button>
          </div>
          
          <div className="border-t border-b py-4 mb-4">
            <h3 className="text-center font-bold text-xl mb-2">Campus Bite</h3>
            <p className="text-center text-gray-600 text-sm mb-4">Digital Receipt</p>
            
            <div className="mb-4">
              <p className="text-sm"><strong>Order Code:</strong> {receipt.orderCode}</p>
              <p className="text-sm"><strong>Date:</strong> {receipt.formattedDate}</p>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Items:</h4>
              {receipt.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm mb-1">
                  <span>{item.foodName} x{item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span>₱{receipt.totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment:</span>
                <span>₱{receipt.payment?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-green-600">
                <span>Change:</span>
                <span>₱{receipt.change?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500">Thank you for your order!</p>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
  );

  if (error) return (
    <div className="text-center mt-10 p-4 bg-red-100 text-red-700 rounded-lg">
      {error}
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Order History</h1>
      
      {history.length === 0 ? (
        <div className="text-center mt-10 p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No order history available.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Received Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.map((entry) => (
                <tr key={entry._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {entry.orderCode}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    ₱{entry.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.formattedDate || "Invalid Date"}
                  </td>
                  <td className="px-6 py-4">
                    <ul className="text-sm text-gray-500">
                      {entry.items.map((item, index) => (
                        <li key={index} className="mb-1">
                          {item.foodName} x {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div>Payment: <span className="text-gray-900">₱{entry.payment?.toFixed(2)}</span></div>
                      <div>Change: <span className="text-green-600">₱{entry.change?.toFixed(2)}</span></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedReceipt(entry)}
                      className="flex items-center px-3 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
                    >
                      <FaReceipt className="mr-2" />
                      View Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
};

export default History;