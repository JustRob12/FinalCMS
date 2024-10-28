import axios from "axios";
import React, { useEffect, useState } from "react";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token"); // Retrieve the user token

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
      alert("Item removed from cart.");
    } catch (error) {
      console.error("Error removing item from cart:", error);
      alert("Failed to remove item.");
    }
  };

  const handleIncrement = async (foodId) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/cart/increment/${foodId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the cart state with new quantity
      setCart((prevCart) => {
        const updatedItems = prevCart.foodItems.map((item) =>
          item.foodId._id === foodId ? { ...item, quantity: response.data.newQuantity } : item
        );
        return { ...prevCart, foodItems: updatedItems };
      });
    } catch (error) {
      console.error("Error incrementing item:", error);
      alert("Failed to increment item.");
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

      // Update the cart state with new quantity
      setCart((prevCart) => {
        const updatedItems = prevCart.foodItems.map((item) =>
          item.foodId._id === foodId ? { ...item, quantity: response.data.newQuantity } : item
        );
        return { ...prevCart, foodItems: updatedItems };
      });
    } catch (error) {
      console.error("Error decrementing item:", error);
      alert("Failed to decrement item.");
    }
  };

  const handlePlaceOrder = async () => {
    try {
      // Step 1: Place the order
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/orders`,
        { cartItems: cart.foodItems },
        { headers: {
          Authorization: `Bearer ${token}`,
        }, }
      );
  
      alert(`Order placed successfully! Your order code is: ${response.data.order.orderCode}`);
      
      // Step 2: Clear the cart
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      setCart(null); // Clear the cart state
  
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order.');
    }
  };
  

  if (loading) return <p>Loading your cart...</p>;
  if (error) return <p>{error}</p>;
  if (!cart || cart.foodItems.length === 0) return <p>Your cart is empty.</p>;

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
