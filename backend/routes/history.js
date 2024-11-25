const express = require('express');
const router = express.Router();
const History = require('../models/history');
const verifyToken = require('../middleware/auth');

// Fetch order history for a specific user
router.get('/user', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching history for user:', userId); // Debug log

    const history = await History.find({ userId })
      .sort({ date: -1 })
      .populate('userId', 'name course year');

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

    console.log('Formatted history:', formattedHistory); // Debug log
    res.json(formattedHistory);
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ 
      message: 'Failed to fetch history.', 
      error: err.message 
    });
  }
});

// Fetch all order histories for admin
router.get('/admin', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const history = await History.find()
      .populate('userId', 'name course year')
      .sort({ date: -1 });

    const formattedHistory = history.map(entry => ({
      _id: entry._id,
      orderCode: entry.orderCode,
      totalPrice: entry.totalPrice,
      createdAt: entry.date.toISOString(),
      items: entry.items,
      userName: entry.userId ? entry.userId.name : 'Unknown',
      userCourse: entry.userId ? entry.userId.course : 'Unknown',
      userYear: entry.userId ? entry.userId.year : 'Unknown'
    }));

    res.json(formattedHistory);
  } catch (err) {
    console.error("Error fetching all histories:", err);
    res.status(500).json({ 
      message: 'Failed to fetch all histories.', 
      error: err.message 
    });
  }
});

module.exports = router;
