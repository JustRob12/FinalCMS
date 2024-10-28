const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  orderCode: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalPrice: { type: Number, required: true },
  timer: { type: Date, required: true },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Notification', notificationSchema);
