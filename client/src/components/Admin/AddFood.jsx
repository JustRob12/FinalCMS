import axios from "axios";
import React, { useEffect, useState } from "react";

const AddFood = () => {
  const [foods, setFoods] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    category: "Meals",
    image: null, // Store the uploaded file
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const fetchFoods = async () => {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/food`
    );
    setFoods(response.data);
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value, // Handle file upload
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(); // Create a FormData object to handle file uploads

    // Append form data
    for (const key in formData) {
      data.append(key, formData[key]);
    }

    if (editingId) {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/food/${editingId}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setEditingId(null);
    } else {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/food/add`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }
    fetchFoods();
    setFormData({
      name: "",
      description: "",
      price: "",
      quantity: "",
      category: "Meals",
      image: null,
    });
  };

  const handleEdit = (food) => {
    setFormData(food);
    setEditingId(food._id);
  };

  const handleDelete = async (id) => {
    await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/food/${id}`);
    fetchFoods();
  };

  const handleNotAvailable = async (id) => {
    await axios.patch(
      `${import.meta.env.VITE_BACKEND_URL}/food/${id}/availability`,
      { available: false }
    );
    fetchFoods();
  };

  const handleAvailable = async (id) => {
    await axios.patch(
      `${import.meta.env.VITE_BACKEND_URL}/food/${id}/availability`,
      { available: true }
    );
    fetchFoods();
  };

  const filteredFoods = foods.filter(
    (food) =>
      (selectedCategory === "All" || food.category === selectedCategory) &&
      food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex max-w-6xl mx-auto p-5 space-x-5">
      {/* Add Food Form */}
      <div className="w-1/3 bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-5 text-center">
          {editingId ? "Edit Food" : "Add Food"}
        </h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full mb-4 p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full mb-4 p-2 border border-gray-300 rounded"
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            required
            className="w-full mb-4 p-2 border border-gray-300 rounded"
          />
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
            className="w-full mb-4 p-2 border border-gray-300 rounded"
          />
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full mb-4 p-2 border border-gray-300 rounded"
          >
            <option value="Meals">Meals</option>
            <option value="Snacks">Snacks</option>
            <option value="Drinks">Drinks</option>
          </select>
          <input
            type="file"
            name="image"
            onChange={handleChange}
            accept="image/*"
            required={!editingId} // Make image required when adding
            className="w-full mb-4 p-2 border border-gray-300 rounded"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200"
          >
            {editingId ? "Update Food" : "Add Food"}
          </button>
        </form>
      </div>

      {/* Food List and Filters */}
      <div className="w-2/3">
        <div className="flex items-center justify-between mb-4">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-gray-300 rounded w-1/2"
          />
          <div>
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-3 py-1 rounded ${
                selectedCategory === "All"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedCategory("Meals")}
              className={`px-3 py-1 rounded ${
                selectedCategory === "Meals"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              Meals
            </button>
            <button
              onClick={() => setSelectedCategory("Snacks")}
              className={`px-3 py-1 rounded ${
                selectedCategory === "Snacks"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              Snacks
            </button>
            <button
              onClick={() => setSelectedCategory("Drinks")}
              className={`px-3 py-1 rounded ${
                selectedCategory === "Drinks"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              Drinks
            </button>
          </div>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFoods.map((food) => (
            <div
              key={food._id}
              className="bg-white shadow-lg rounded-lg p-4 flex flex-col"
            >
              <div className="w-full h-48 relative">
                <img
                  src={`${import.meta.env.VITE_BACKEND_URL}/${
                    food.image
                  }`} // Ensure this URL is correct
                  alt={food.name}
                  className="w-full h-full object-cover rounded"
                  onError={(e) => {
                    e.target.onerror = null; // Prevents looping
                    e.target.src = "path/to/default/image.jpg"; // Fallback image path
                  }}
                />
              </div>
              <h2 className="text-lg font-bold">{food.name}</h2>
              <p className="text-gray-600">Description: {food.description}</p>
              <p className="text-gray-600">Category: {food.category}</p>
              <p className="text-gray-600">Price: ₱{food.price}</p>
              <p className="text-gray-600">Quantity: {food.quantity}</p>
              <p
                className={`font-bold ${
                  food.available ? "text-green-500" : "text-red-500"
                }`}
              >
                {food.available ? "Available" : "Not Available"}
              </p>
              <div className="flex justify-between mt-auto">
                <button
                  onClick={() => handleEdit(food)}
                  className="text-blue-500 hover:underline"
                >
                  Edit
                </button>
                {food.available ? (
                  <button
                    onClick={() => handleNotAvailable(food._id)}
                    className="text-red-500 hover:underline"
                  >
                    Mark as Unavailable
                  </button>
                ) : (
                  <button
                    onClick={() => handleAvailable(food._id)}
                    className="text-green-500 hover:underline"
                  >
                    Mark as Available
                  </button>
                )}
                <button
                  onClick={() => handleDelete(food._id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddFood;
