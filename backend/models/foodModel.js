// models/foodModel.js

const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    category: { type: String, enum: ['Meals', 'Snacks', 'Drinks', 'Materials'], required: true },
    available: { type: Boolean, default: true }, // Availability status
    image: { type: String } // Path to the image
});

module.exports = mongoose.model('Food', foodSchema);
