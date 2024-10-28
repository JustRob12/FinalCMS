const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const verifyToken = require('../middleware/auth');

// Create a notification
router.post('/', verifyToken, async (req, res) => {
  const { orderCode, userId, totalPrice } = req.body;

  // Validate request body
  if (!orderCode || !userId || !totalPrice) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  const notification = new Notification({
    orderCode,
    userId,
    totalPrice,
    timer: new Date(Date.now() + 20 * 60 * 1000), // 20 minutes from now
  });

  try {
    const savedNotification = await notification.save();
    res.status(201).json(savedNotification);
  } catch (err) {
    console.error("Error saving notification:", err); // Log the error for debugging
    res.status(500).json({ message: 'Failed to save notification.', error: err.message });
  }
});

// Fetch notifications for a specific user
router.get('/', verifyToken, async (req, res) => {
  const userId = req.user.id; // Extract user ID from token payload

  console.log("Fetching notifications for User ID:", userId); // Log user info for debugging

  try {
    const notifications = await Notification.find({ userId }).sort({ date: -1 });
    res.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err); // Log any errors for debugging
    res.status(500).json({ message: 'Failed to fetch notifications.', error: err.message });
  }
});

module.exports = router;
