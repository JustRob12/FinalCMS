import axios from 'axios';
import React, { useEffect, useState } from 'react';

const Menu = () => {
  const [foods, setFoods] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const token = localStorage.getItem('token'); // Store token securely after login

  const fetchFoods = async () => {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/food`);
    setFoods(response.data);
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const handleAddToCart = async (food) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/cart`,
        {
          foodId: food._id,
          name: food.name,
          price: food.price,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }, // Attach token to request
        }
      );
      alert(`${food.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart.');
    }
  };

  const filteredFoods = foods.filter((food) => {
    const matchesCategory = filter === 'All' || food.category === filter;
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Menu</h1>
      <input
        type="text"
        placeholder="Search for food..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border rounded-lg p-2 mb-4 w-full"
      />
      <div className="mb-4">
        {['Meals', 'Snacks', 'Drinks', 'All'].map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`mr-2 px-4 py-2 rounded ${
              filter === category ? 'bg-indigo-600 text-white' : 'bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFoods.map((food) => (
          <div key={food._id} className="bg-white rounded-lg shadow-lg p-4 flex flex-col items-center">
            <img
              src={`${import.meta.env.VITE_BACKEND_URL}/${food.image}`}
              alt={food.name}
              className="w-full h-48 object-cover mb-2 rounded-lg"
            />
            <h2 className="font-bold text-lg">{food.name}</h2>
            <p className="text-gray-600">{food.description}</p>
            <p className="font-semibold text-lg">₱{food.price}</p>
            <p className={`font-bold ${food.available ? 'text-green-500' : 'text-red-500'}`}>
              {food.available ? 'Available' : 'Not Available'}
            </p>
            <button
              onClick={() => handleAddToCart(food)}
              className={`mt-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 ${
                !food.available ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!food.available}
            >
              {food.available ? 'Add to Cart' : 'Unavailable'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;
