const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const verifyToken = require('../middleware/auth');
const History = require("../models/history");

// Create a notification
router.post('/', verifyToken, async (req, res) => {
  const { orderCode, userId, totalPrice, items } = req.body; // Include items

  // Validate request body
  if (!orderCode || !userId || !totalPrice || !items) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  const notification = new Notification({
    orderCode,
    userId,
    totalPrice,
    items, // Include items in the notification
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
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }); // Sort by createdAt
    res.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err); // Log any errors for debugging
    res.status(500).json({ message: 'Failed to fetch notifications.', error: err.message });
  }
});

// Fetch all notifications with populated user names
router.get('/all', verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('userId', 'name') // Populate the 'name' field from the 'User' model
      .sort({ createdAt: -1 }); // Sort by createdAt
    res.status(200).json(notifications);
  } catch (err) {
    console.error("Error fetching all notifications:", err);
    res.status(500).json({ message: 'Failed to fetch notifications.', error: err.message });
  }
});

// Delete a notification
router.delete('/:id', verifyToken, async (req, res) => {
  const notificationId = req.params.id; // Get notification ID from request parameters

  try {
    const deletedNotification = await Notification.findByIdAndDelete(notificationId); // Delete notification by ID

    if (!deletedNotification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    res.status(200).json({ message: 'Notification deleted successfully.' });
  } catch (err) {
    console.error("Error deleting notification:", err);
    res.status(500).json({ message: 'Failed to delete notification.', error: err.message });
  }
});


router.patch("/:id/received", verifyToken, async (req, res) => {
  try {
    const { userId, items, totalPrice, activatedAt } = req.body; // Include activatedAt

    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    const historyEntry = new History({
      userId,
      orderCode: notification.orderCode,
      totalPrice,
      items,
      activatedAt,  // Include activatedAt in the history entry
    });

    await historyEntry.save();
    await notification.deleteOne();

    res.json({ message: "Order marked as received and added to history." });
  } catch (error) {
    console.error("Error marking order as received:", error.message); // Log the specific error message
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});








module.exports = router;
