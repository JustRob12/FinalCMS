const express = require('express');
const router = express.Router();
const History = require('../models/History');
const verifyToken = require('../middleware/auth');

// Fetch order history for a specific user
router.get('/user', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching history for user:', userId);

    const history = await History.find({ userId })
      .sort({ date: -1 })
      .populate('userId', 'name course year');

    const formattedHistory = history.map(entry => ({
      _id: entry._id,
      orderCode: entry.orderCode,
      totalPrice: entry.totalPrice,
      payment: entry.payment,
      change: entry.change,
      createdAt: entry.date,
      formattedDate: entry.date ? new Date(entry.date).toLocaleString() : null,
      items: entry.items,
      userName: entry.userId ? entry.userId.name : 'Unknown',
      userCourse: entry.userId ? entry.userId.course : 'Unknown',
      userYear: entry.userId ? entry.userId.year : 'Unknown'
    }));

    console.log('Formatted history:', formattedHistory);
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
      payment: entry.payment,
      change: entry.change,
      createdAt: entry.date,
      formattedDate: entry.date ? new Date(entry.date).toLocaleString() : null,
      items: entry.items,
      customerName: entry.userId ? entry.userId.name : 'Unknown',
      course: entry.userId ? entry.userId.course : 'Unknown',
      year: entry.userId ? entry.userId.year : 'Unknown',
      total: entry.totalPrice
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

// Add validation to your history route
router.post('/', verifyToken, async (req, res) => {
  try {
    const { 
      orderCode, 
      userId, 
      items, 
      totalPrice, 
      payment, 
      change, 
      date 
    } = req.body;

    // Validate required fields
    if (!orderCode || !userId || !items || !totalPrice || !payment) {
      return res.status(400).json({ 
        message: 'Missing required fields' 
      });
    }

    const history = new History({
      orderCode,
      userId,
      items,
      totalPrice,
      payment,
      change,
      date: date || new Date()
    });

    await history.save();
    res.status(201).json({ 
      message: 'History created successfully', 
      history 
    });
  } catch (error) {
    console.error('Error creating history:', error);
    res.status(500).json({ 
      message: 'Error creating history', 
      error: error.message 
    });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const deletedHistory = await History.findByIdAndDelete(req.params.id);
    if (!deletedHistory) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting record', error: error.message });
  }
});

module.exports = router;
