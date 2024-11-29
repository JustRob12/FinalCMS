import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaReceipt, FaTimes, FaDownload, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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

  const handleDelete = async (entryId) => {
    try {
      const result = await Swal.fire({
        title: 'Delete Record',
        text: 'Are you sure you want to delete this record?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        await axios.delete(`${backendUrl}/history/${entryId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setHistory(history.filter(entry => entry._id !== entryId));

        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Record has been deleted.',
          showConfirmButton: false,
          timer: 1500,
          position: 'top-end',
          toast: true
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete record.',
        confirmButtonColor: '#4F46E5'
      });
    }
  };

  const downloadReceipt = async (receipt) => {
    const receiptElement = document.getElementById('receipt-content');
    if (!receiptElement) return;

    try {
      const canvas = await html2canvas(receiptElement, {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 150] // Receipt size
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`receipt-${receipt.orderCode}.pdf`);

      Swal.fire({
        icon: 'success',
        title: 'Downloaded!',
        text: 'Receipt has been downloaded successfully.',
        showConfirmButton: false,
        timer: 1500,
        position: 'top-end',
        toast: true
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to download receipt.',
        confirmButtonColor: '#4F46E5'
      });
    }
  };

  // Receipt Modal Component
  const ReceiptModal = ({ receipt, onClose }) => {
    if (!receipt) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Receipt</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => downloadReceipt(receipt)}
                className="text-indigo-600 hover:text-indigo-800 p-2"
                title="Download Receipt"
              >
                <FaDownload size={20} />
              </button>
              <button 
                onClick={() => {
                  onClose();
                  handleDelete(receipt._id);
                }}
                className="text-red-600 hover:text-red-800 p-2"
                title="Delete Record"
              >
                <FaTrash size={20} />
              </button>
              <button 
                onClick={onClose} 
                className="text-gray-500 hover:text-gray-700 p-2"
                title="Close"
              >
                <FaTimes size={20} />
              </button>
            </div>
          </div>
          
          <div id="receipt-content" className="border-t border-b py-4 mb-4 bg-white">
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
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedReceipt(entry)}
                        className="flex items-center px-3 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
                      >
                        <FaReceipt className="mr-2" />
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(entry._id)}
                        className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                      >
                        <FaTrash className="mr-2" />
                        Delete
                      </button>
                    </div>
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