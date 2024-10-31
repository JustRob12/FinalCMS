// models/History.js
const mongoose = require('mongoose');

// Define the schema for the history of orders
const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user
  orderCode: { type: String, required: true }, // The unique code for the order
  items: [{
    foodName: { type: String, required: true }, // Name of the food item
    quantity: { type: Number, required: true }, // Quantity of the food item
  }],
  totalPrice: { type: Number, required: true }, // Total price of the order
  date: { type: Date, default: Date.now } // Date when the order was received
});

// Create and export the model
module.exports = mongoose.model('History', historySchema);
