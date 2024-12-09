import axios from "axios";
import React, { useEffect, useState } from "react";
import Swal from 'sweetalert2';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { MdCancel } from 'react-icons/md';
import { IoCheckmarkCircle, IoCloseCircle } from 'react-icons/io5';

const AddFood = () => {
  const [foods, setFoods] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    category: "Meals",
    image: null,
  });
  const [currentImage, setCurrentImage] = useState(null);
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
    
    const result = await Swal.fire({
      title: editingId ? 'Update Food Item?' : 'Add New Food Item?',
      text: editingId ? 'Are you sure you want to update this food item?' : 'Are you sure you want to add this food item?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: editingId ? 'Yes, update it!' : 'Yes, add it!'
    });

    if (result.isConfirmed) {
      try {
        const data = new FormData();
        
        if (formData.image || !editingId) {
          data.append('image', formData.image);
        }
        
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('quantity', formData.quantity);
        data.append('category', formData.category);

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
          setCurrentImage(null);
        } else {
          await axios.post(`${import.meta.env.VITE_BACKEND_URL}/food/add`, data, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
        }
        
        Swal.fire(
          'Success!',
          editingId ? 'Food item has been updated.' : 'Food item has been added.',
          'success'
        );

        fetchFoods();
        setFormData({
          name: "",
          description: "",
          price: "",
          quantity: "",
          category: "Meals",
          image: null,
        });
      } catch (error) {
        Swal.fire(
          'Error!',
          'There was an error processing your request.',
          'error'
        );
      }
    }
  };

  const handleEdit = (food) => {
    setFormData({
      name: food.name,
      description: food.description,
      price: food.price,
      quantity: food.quantity,
      category: food.category,
      image: null,
    });
    setCurrentImage(`${import.meta.env.VITE_BACKEND_URL}/${food.image}`);
    setEditingId(food._id);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Food Item?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/food/${id}`);
        Swal.fire(
          'Deleted!',
          'Food item has been deleted.',
          'success'
        );
        fetchFoods();
      } catch (error) {
        Swal.fire(
          'Error!',
          'There was an error deleting the item.',
          'error'
        );
      }
    }
  };

  const handleNotAvailable = async (id) => {
    const result = await Swal.fire({
      title: 'Mark as Unavailable?',
      text: 'This item will be marked as not available.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, mark it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.patch(
          `${import.meta.env.VITE_BACKEND_URL}/food/${id}/availability`,
          { available: false }
        );
        Swal.fire(
          'Updated!',
          'Food item has been marked as unavailable.',
          'success'
        );
        fetchFoods();
      } catch (error) {
        Swal.fire(
          'Error!',
          'There was an error updating the availability.',
          'error'
        );
      }
    }
  };

  const handleAvailable = async (id) => {
    const result = await Swal.fire({
      title: 'Mark as Available?',
      text: 'This item will be marked as available.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, mark it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.patch(
          `${import.meta.env.VITE_BACKEND_URL}/food/${id}/availability`,
          { available: true }
        );
        Swal.fire(
          'Updated!',
          'Food item has been marked as available.',
          'success'
        );
        fetchFoods();
      } catch (error) {
        Swal.fire(
          'Error!',
          'There was an error updating the availability.',
          'error'
        );
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      quantity: "",
      category: "Meals",
      image: null,
    });
    setEditingId(null);
    setCurrentImage(null);
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
          {editingId ? "Edit" : "Add"}
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
            <option value="Materials">Materials</option>
          </select>
          {editingId && currentImage && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Current Image:</p>
              <img 
                src={currentImage} 
                alt="Current food" 
                className="w-full h-40 object-cover rounded"
              />
            </div>
          )}
          <div className="mb-4">
            <input
              type="file"
              name="image"
              onChange={handleChange}
              accept="image/*"
              required={!editingId}
              className="w-full p-2 border border-gray-300 rounded"
            />
            {editingId && (
              <p className="text-sm text-gray-500 mt-1">
                Leave empty to keep the current image
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200"
            >
              {editingId ? "Update" : "Add"}
            </button>
            
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition duration-200"
              >
                Cancel
              </button>
            )}
          </div>
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
            <button
              onClick={() => setSelectedCategory("Materials")}
              className={`px-3 py-1 rounded ${
                selectedCategory === "Materials"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              Materials
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
                  src={`${import.meta.env.VITE_BACKEND_URL}/${food.image}`}
                  alt={food.name}
                  className="w-full h-full object-cover rounded"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "path/to/default/image.jpg";
                  }}
                />
                {parseInt(food.quantity) <= 5 && food.available && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                    Low Stock!
                  </div>
                )}
              </div>
              <h2 className="text-lg font-bold">{food.name}</h2>
              <p className="text-gray-600">Description: {food.description}</p>
              <p className="text-gray-600">Category: {food.category}</p>
              <p className="text-gray-600">Price: ₱{food.price}</p>
              <p className={`text-gray-600 ${parseInt(food.quantity) <= 5 ? 'text-red-500 font-bold' : ''}`}>
                Quantity: {food.quantity}
              </p>
              <p className={`font-bold ${food.available ? "text-green-500" : "text-red-500"}`}>
                {food.available ? "Available" : "Not Available"}
              </p>
              
              <div className="flex justify-between mt-auto pt-2 border-t">
                <button
                  onClick={() => handleEdit(food)}
                  className="text-blue-500 hover:text-blue-700 transition-colors"
                  title="Edit"
                >
                  <FaEdit size={20} />
                </button>
                
                {food.available ? (
                  <button
                    onClick={() => handleNotAvailable(food._id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Mark as Unavailable"
                  >
                    <IoCloseCircle size={22} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleAvailable(food._id)}
                    className="text-green-500 hover:text-green-700 transition-colors"
                    title="Mark as Available"
                  >
                    <IoCheckmarkCircle size={22} />
                  </button>
                )}
                
                <button
                  onClick={() => handleDelete(food._id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  title="Delete"
                >
                  <FaTrashAlt size={18} />
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
