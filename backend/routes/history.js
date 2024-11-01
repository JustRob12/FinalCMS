const express = require('express');
const router = express.Router();
const History = require('../models/history'); // Ensure correct casing for the model
const verifyToken = require('../middleware/auth');

// Fetch order history for a specific user
router.get('/', verifyToken, async (req, res) => {
  const userId = req.user.id; // Extract user ID from token payload

  console.log("Fetching history for User ID:", userId); // Log user info for debugging

  try {
    const history = await History.find({ userId }).sort({ date: -1 }); // Sort by date

    // Map through the history to include formatted date
    const formattedHistory = history.map(entry => ({
      _id: entry._id,
      orderCode: entry.orderCode,
      totalPrice: entry.totalPrice,
      createdAt: entry.date, // Use the date field from the model
      formattedDate: entry.date ? new Date(entry.date).toLocaleString() : null, // Format the date
      items: entry.items,
    }));

    res.json(formattedHistory);
  } catch (err) {
    console.error("Error fetching history:", err); // Log any errors for debugging
    res.status(500).json({ message: 'Failed to fetch history.', error: err.message });
  }
});


// Fetch all order histories for admin
router.get('/', verifyToken, async (req, res) => {
  console.log("Fetching all histories for admin"); // Log for debugging

  try {
    const history = await History.find()
      .populate('userId') // Assuming userId references the User model
      .sort({ date: -1 });

    // Map through the history to include formatted date and user details
    const formattedHistory = history.map(entry => ({
      _id: entry._id,
      orderCode: entry.orderCode,
      totalPrice: entry.totalPrice,
      createdAt: entry.date,
      formattedDate: entry.date ? new Date(entry.date).toLocaleString() : null,
      items: entry.items,
      userName: entry.userId.name, // Adjust according to your user model
      userCourse: entry.userId.course,
      userYear: entry.userId.year,
    }));

    res.json(formattedHistory);
  } catch (err) {
    console.error("Error fetching all histories:", err); // Log any errors for debugging
    res.status(500).json({ message: 'Failed to fetch all histories.', error: err.message });
  }
});


module.exports = router;
