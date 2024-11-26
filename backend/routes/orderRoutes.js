const express = require('express');
const verifyToken = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User'); // Import the User model
const Notification = require('../models/Notification'); // Ensure you have a Notification model
const router = express.Router();

// Random code generator function
const generateRandomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Place an order
router.post('/', verifyToken, async (req, res) => {
  const { cartItems } = req.body;

  try {
    // Get user details
    const user = await User.findById(req.user.id).select('course year'); // Get course and year info

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate total price
    const totalPrice = cartItems.reduce(
      (total, item) => total + item.foodId.price * item.quantity,
      0
    );

    // Generate the random order code
    const orderCode = generateRandomCode();

    // Create a new order
    const newOrder = new Order({
      userId: req.user.id,
      items: cartItems,
      totalPrice,
      orderCode,
      course: user.course,
      year: user.year,
    });
    await newOrder.save();

    res.status(201).json({
      message: 'Order placed successfully',
      order: newOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Get all orders
router.get('/', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.foodId') // Populate food items
      .populate({
        path: 'userId', // Populate user details using the userId
        select: 'name course year', // Include name, course, and year
      });

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Create notification route
router.post('/notification', verifyToken, async (req, res) => {
  const { orderCode, userId, totalPrice } = req.body;

  try {
    const newNotification = new Notification({
      orderCode,
      userId,
      totalPrice,
      message: 'Order notification created',
    });

    await newNotification.save();

    res.status(201).json({
      message: 'Notification created successfully',
      notification: newNotification,
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Delete order by ID
router.delete('/:orderId', verifyToken, async (req, res) => {
  const { orderId } = req.params;

  try {
    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

module.exports = router;
