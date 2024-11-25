const express = require('express');
const router = express.Router();
const History = require('../models/history');
const verifyToken = require('../middleware/auth');

// Fetch order history for a specific user
router.get('/user', verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const history = await History.find({ userId }).sort({ date: -1 });

    const formattedHistory = history.map(entry => ({
      _id: entry._id,
      orderCode: entry.orderCode,
      totalPrice: entry.totalPrice,
      createdAt: entry.date,
      formattedDate: entry.date ? new Date(entry.date).toLocaleString() : null,
      items: entry.items,
    }));

    res.json(formattedHistory);
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ message: 'Failed to fetch history.', error: err.message });
  }
});

// Fetch all order histories for admin
router.get('/admin', verifyToken, async (req, res) => {
  // Check if user has admin role
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }

  try {
    const history = await History.find()
      .populate('userId', 'name course year') // Only populate necessary fields
      .sort({ date: -1 });

    const formattedHistory = history.map(entry => ({
      _id: entry._id,
      orderCode: entry.orderCode,
      totalPrice: entry.totalPrice,
      createdAt: entry.date,
      formattedDate: entry.date ? new Date(entry.date).toLocaleString() : null,
      items: entry.items,
      userName: entry.userId ? entry.userId.name : 'Unknown',
      userCourse: entry.userId ? entry.userId.course : 'Unknown',
      userYear: entry.userId ? entry.userId.year : 'Unknown'
    }));

    res.json(formattedHistory);
  } catch (err) {
    console.error("Error fetching all histories:", err);
    res.status(500).json({ message: 'Failed to fetch all histories.', error: err.message });
  }
});

module.exports = router;
