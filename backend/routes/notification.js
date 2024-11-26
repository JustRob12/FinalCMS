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
      .populate({
        path: 'userId',
        select: 'name course year role' // Added role to selected fields
      })
      .sort({ createdAt: -1 });

    // Transform the data to include user details
    const formattedNotifications = notifications.map(notification => ({
      _id: notification._id,
      orderCode: notification.orderCode,
      totalPrice: notification.totalPrice,
      items: notification.items,
      timer: notification.timer,
      timeLeft: notification.timer - Date.now(),
      userId: notification.userId,
      course: notification.userId?.course || 'N/A',
      year: notification.userId?.year || 'N/A',
      name: notification.userId?.name || 'N/A',
      role: notification.userId?.role || 'user' // Added role to the formatted data
    }));

    res.status(200).json(formattedNotifications);
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
    const { userId, items, totalPrice, payment, change, activatedAt } = req.body;
    
    // Update notification status
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      {
        status: 'received',
        payment,
        change,
        activatedAt
      },
      { new: true }
    );

    // Create history entry
    const history = new History({
      orderCode: notification.orderCode,
      userId,
      items,
      totalPrice,
      payment,
      change,
      date: activatedAt
    });
    await history.save();

    res.json({ message: 'Order received successfully', notification });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
});

router.patch('/:id/activate', verifyToken, async (req, res) => {
  try {
    const { 
      userId, 
      items, 
      totalPrice, 
      payment, 
      change, 
      activatedAt 
    } = req.body;

    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      {
        status: 'completed',
        payment,
        change,
        activatedAt
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ 
      message: 'Notification activated successfully', 
      notification 
    });
  } catch (error) {
    console.error('Error activating notification:', error);
    res.status(500).json({ 
      message: 'Error activating notification', 
      error: error.message 
    });
  }
});








module.exports = router;
