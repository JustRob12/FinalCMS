const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const History = require('../models/history');
const Food = require('../models/foodModel');
const verifyToken = require('../middleware/auth');
const { 
  startOfDay, 
  endOfDay, 
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  format 
} = require('date-fns');

// Get comprehensive report
router.get('/comprehensive', verifyToken, async (req, res) => {
  try {
    const { range = 'today' } = req.query;
    const today = new Date();
    const endOfToday = endOfDay(today);
    let startDate;

    switch (range) {
      case 'today':
        startDate = startOfDay(today);
        break;
      case 'week':
        startDate = startOfWeek(today);
        break;
      case 'month':
        startDate = startOfMonth(today);
        break;
      case 'year':
        startDate = startOfYear(today);
        break;
      default:
        startDate = startOfDay(today);
    }

    // Get filtered history based on date range
    const filteredHistory = await History.find({
      date: { 
        $gte: startDate, 
        $lte: endOfToday 
      }
    });

    // Calculate totals for the filtered period
    const totalRevenue = filteredHistory.reduce((sum, entry) => sum + (entry.totalPrice || 0), 0);
    const totalOrders = filteredHistory.length;

    // Get recent activity
    const recentHistory = await History.find()
      .sort({ date: -1 })
      .limit(10)
      .populate('userId', 'name course year');

    // Add low stock query
    const lowStockItems = await Food.find({
      quantity: { $lte: 20 } // Assuming items with 20 or fewer units are considered low stock
    }).select('name quantity price category');

    // Format the response
    res.json({
      historyMetrics: {
        total: totalOrders,
        today: range === 'today' ? totalOrders : 0,
        thisWeek: range === 'week' ? totalOrders : 0,
        thisMonth: range === 'month' ? totalOrders : 0,
        thisYear: range === 'year' ? totalOrders : 0
      },
      revenueMetrics: {
        total: totalRevenue,
        today: range === 'today' ? totalRevenue : 0,
        thisWeek: range === 'week' ? totalRevenue : 0,
        thisMonth: range === 'month' ? totalRevenue : 0,
        thisYear: range === 'year' ? totalRevenue : 0,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
      },
      recentActivity: {
        history: recentHistory.map(entry => ({
          orderCode: entry.orderCode,
          customerName: entry.userId?.name || 'Unknown',
          course: entry.userId?.course,
          year: entry.userId?.year,
          total: entry.totalPrice,
          items: entry.items,
          date: format(new Date(entry.date), 'yyyy-MM-dd HH:mm')
        }))
      },
      lowStock: {
        items: lowStockItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          category: item.category
        }))
      }
    });

  } catch (error) {
    console.error('Comprehensive report error:', error);
    res.status(500).json({ 
      message: 'Error generating comprehensive report', 
      error: error.message 
    });
  }
});

module.exports = router; 