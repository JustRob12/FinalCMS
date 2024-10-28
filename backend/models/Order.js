const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    items: [
      {
        foodId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Food',
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    orderCode: { // Ensure the field name matches exactly
      type: String,
      required: true,
      unique: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });
  
  const Order = mongoose.model('Order', orderSchema);
  module.exports = Order;
  
