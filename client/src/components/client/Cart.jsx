import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaArrowRight } from 'react-icons/fa';
import Swal from 'sweetalert2';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token"); // Retrieve the user token
  const course = localStorage.getItem("course"); // Retrieve the course
  const year = localStorage.getItem("year"); // Retrieve the year
  const userId = localStorage.getItem("userId"); // Retrieve the user ID

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/cart`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCart(response.data);
      } catch (err) {
        setError(
          err.response ? err.response.data.message : "Error fetching cart"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [token]);

  const handleRemoveItem = async (foodId) => {
    try {
      // Show confirmation dialog first
      const result = await Swal.fire({
        title: 'Remove Item?',
        text: 'Are you sure you want to remove this item from your cart?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444', // red-500
        cancelButtonColor: '#6B7280', // gray-500
        confirmButtonText: 'Yes, remove it!'
      });

      if (result.isConfirmed) {
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/cart/item/${foodId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCart((prevCart) => ({
          ...prevCart,
          foodItems: prevCart.foodItems.filter((item) => item.foodId._id !== foodId),
        }));

        Swal.fire({
          icon: 'success',
          title: 'Removed!',
          text: 'Item has been removed from your cart',
          showConfirmButton: false,
          timer: 1500,
          position: 'top-end',
          toast: true
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to remove item from cart',
        confirmButtonColor: '#4F46E5'
      });
    }
  };

  const handleIncrement = async (foodId) => {
    try {
      // Find the current item in the cart
      const currentItem = cart.foodItems.find(item => item.foodId._id === foodId);

      // Check if incrementing would exceed available quantity
      if (currentItem.quantity >= currentItem.foodId.quantity) {
        Swal.fire({
          icon: 'warning',
          title: 'Maximum Quantity Reached',
          text: `Sorry, only ${currentItem.foodId.quantity} items are available in stock.`,
          confirmButtonColor: '#4F46E5'
        });
        return;
      }

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/cart/increment/${foodId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCart((prevCart) => {
        const updatedItems = prevCart.foodItems.map((item) =>
          item.foodId._id === foodId ? { ...item, quantity: response.data.newQuantity } : item
        );
        return { ...prevCart, foodItems: updatedItems };
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to increment item quantity',
        confirmButtonColor: '#4F46E5'
      });
    }
  };

  const handleDecrement = async (foodId) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/cart/decrement/${foodId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCart((prevCart) => {
        const updatedItems = prevCart.foodItems.map((item) =>
          item.foodId._id === foodId ? { ...item, quantity: response.data.newQuantity } : item
        );
        return { ...prevCart, foodItems: updatedItems };
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to decrement item quantity',
        confirmButtonColor: '#4F46E5'
      });
    }
  };

  const handlePlaceOrder = async () => {
    try {
      // Show confirmation dialog first
      const result = await Swal.fire({
        title: 'Place Order',
        text: 'Are you sure you want to place this order?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#22C55E', // green-500
        cancelButtonColor: '#6B7280', // gray-500
        confirmButtonText: 'Yes, place order!'
      });

      if (result.isConfirmed) {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/orders`,
          {
            cartItems: cart.foodItems,
            course,
            year,
            userId
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/cart`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCart(null);

        // Show success message with order code
        Swal.fire({
          icon: 'success',
          title: 'Order Placed Successfully!',
          html: `Your order code is: <br><strong>${response.data.order.orderCode}</strong>`,
          confirmButtonColor: '#22C55E'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Order Failed',
        text: error.response?.data?.message || 'Failed to place order',
        confirmButtonColor: '#4F46E5'
      });
    }
  };

  // Empty cart component
  const EmptyCart = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-64 h-64 mb-8 relative">
        {/* Shopping cart illustration */}
        <div className="absolute inset-0 bg-indigo-100 rounded-full opacity-50"></div>
        <FaShoppingCart className="w-32 h-32 text-indigo-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        Your Cart is Empty
      </h2>

      <p className="text-gray-600 text-center mb-8 max-w-md">
        Looks like you haven't added anything to your cart yet.
        Browse our delicious menu and find something you'll love!
      </p>

      <Link
        to="/menu"
        className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full
                 hover:bg-indigo-700 transition-colors duration-300 shadow-lg hover:shadow-xl"
      >
        <span>Browse Menu</span>
        <FaArrowRight className="w-4 h-4" />
      </Link>

      {/* Additional suggestions */}
      <div className="mt-12 text-center">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Quick Suggestions
        </h3>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
            Popular Items
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
            Today's Special
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
            Best Sellers
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="text-red-500 text-center">
        <p className="text-xl font-semibold mb-2">Oops! Your Cart is Empty</p>

      </div>
    </div>
  );

  if (!cart || cart.foodItems.length === 0) return <EmptyCart />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      <div className="grid grid-cols-1 gap-4">
        {cart.foodItems.map((item) => (
          <div
            key={item.foodId._id}
            className="flex items-center justify-between bg-white p-4 shadow rounded-lg"
          >
            <img
              src={`${import.meta.env.VITE_BACKEND_URL}/${item.foodId.image}`}
              alt={item.foodId.name}
              className="w-20 h-20 object-cover rounded"
            />
            <div className="ml-4">
              <h2 className="text-xl font-semibold">{item.foodId.name}</h2>
              <p className="text-gray-600">
                ₱{item.foodId.price} x {item.quantity}
              </p>
              <p className="text-gray-500">
                Total: ₱{item.foodId.price * item.quantity}
              </p>
              <div className="flex items-center mt-2">
                <button
                  onClick={() => handleDecrement(item.foodId._id)}
                  className="bg-gray-200 text-gray-800 px-2 py-1 rounded-l hover:bg-gray-300"
                >
                  -
                </button>
                <span className="mx-2">{item.quantity}</span>
                <button
                  onClick={() => handleIncrement(item.foodId._id)}
                  className="bg-gray-200 text-gray-800 px-2 py-1 rounded-r hover:bg-gray-300"
                >
                  +
                </button>
              </div>
            </div>
            <button
              onClick={() => handleRemoveItem(item.foodId._id)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <p className="text-xl font-bold">
          Total Amount: ₱
          {cart.foodItems.reduce(
            (total, item) => total + item.foodId.price * item.quantity,
            0
          )}
        </p>
      </div>
      <button
        onClick={handlePlaceOrder}
        className="mt-4 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
      >
        Place Order
      </button>
    </div>
  );
};

export default Cart;
