const express = require('express');
const verifyToken = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User'); // Import the User model
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

router.post('/', verifyToken, async (req, res) => {
  const { cartItems } = req.body;

  try {
    // Calculate total price
    const totalPrice = cartItems.reduce(
      (total, item) => total + item.foodId.price * item.quantity,
      0
    );

    // Generate the random order code
    const orderCode = generateRandomCode();

    // Ensure the code is included in the order creation
    const newOrder = new Order({
      userId: req.user.id,
      items: cartItems,
      totalPrice,
      orderCode, // Make sure the name matches the schema
    });

    await newOrder.save();

    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});



// Get all orders route
router.get('/', async (req, res) => {
  try {
    // Fetch all orders and populate user info
    const orders = await Order.find()
      .populate('items.foodId') // Populate food items
      .populate({ 
        path: 'userId', // Populate user details using the userId
        select: 'name'  // Only select the name field
      });

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
    const { orderCode, userId, totalPrice } = req.body;
  
    try {
      const newNotification = new Notification({
        orderCode,
        userId,
        totalPrice,
        // Include any other fields required
      });
  
      await newNotification.save();
  
      res.status(201).json({ message: 'Notification created successfully', notification: newNotification });
    } catch (error) {
      console.error('Error creating notification:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  });

  
  

module.exports = router;
