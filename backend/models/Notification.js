const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  orderCode: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  totalPrice: Number,
  items: [
    {
      foodName: String,
      quantity: Number,
    },
  ],
  timer: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
