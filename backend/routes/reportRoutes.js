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
  format 
} = require('date-fns');

// Get comprehensive report
router.get('/comprehensive', verifyToken, async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);
    const startOfThisWeek = startOfWeek(today);
    const startOfThisMonth = startOfMonth(today);

    // Get all required data
    const [
      // Orders Statistics
      totalOrders,
      todayOrders,
      weeklyOrders,
      monthlyOrders,
      
      // Revenue Statistics
      totalRevenue,
      todayRevenue,
      weeklyRevenue,
      monthlyRevenue,

      // User Statistics
      totalUsers,
      usersByYear,
      usersByCourse,

      // Food Statistics
      topSellingItems,
      foodInventory,

      // Recent Activity
      recentOrders,
      recentHistory

    ] = await Promise.all([
      // Orders counts
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfToday, $lte: endOfToday } }),
      Order.countDocuments({ createdAt: { $gte: startOfThisWeek, $lte: today } }),
      Order.countDocuments({ createdAt: { $gte: startOfThisMonth, $lte: today } }),

      // Revenue calculations
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfToday, $lte: endOfToday } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfThisWeek, $lte: today } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfThisMonth, $lte: today } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),

      // User analytics
      User.countDocuments({ role: 'user' }),
      User.aggregate([
        { $match: { role: 'user' } },
        { $group: { _id: '$year', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      User.aggregate([
        { $match: { role: 'user' } },
        { $group: { _id: '$course', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),

      // Food analytics
      Order.aggregate([
        { $unwind: '$items' },
        { 
          $group: {
            _id: '$items.foodId',
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
          }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 }
      ]),
      Food.find().select('name quantity price available'),

      // Recent activity
      Order.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('userId', 'name course year'),
      History.find()
        .sort({ date: -1 })
        .limit(10)
        .populate('userId', 'name course year')
    ]);

    // Format the response
    res.json({
      orderMetrics: {
        total: totalOrders,
        today: todayOrders,
        thisWeek: weeklyOrders,
        thisMonth: monthlyOrders
      },
      revenueMetrics: {
        total: totalRevenue[0]?.total || 0,
        today: todayRevenue[0]?.total || 0,
        thisWeek: weeklyRevenue[0]?.total || 0,
        thisMonth: monthlyRevenue[0]?.total || 0,
        averageOrderValue: (totalRevenue[0]?.total || 0) / totalOrders || 0
      },
      userMetrics: {
        total: totalUsers,
        byYear: usersByYear,
        byCourse: usersByCourse
      },
      foodMetrics: {
        topSelling: topSellingItems,
        inventory: foodInventory,
        lowStock: foodInventory.filter(item => item.quantity < 10)
      },
      recentActivity: {
        orders: recentOrders.map(order => ({
          orderCode: order.orderCode,
          customerName: order.userId?.name || 'Unknown',
          course: order.userId?.course,
          year: order.userId?.year,
          total: order.totalPrice,
          date: format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm')
        })),
        history: recentHistory.map(entry => ({
          orderCode: entry.orderCode,
          customerName: entry.userId?.name || 'Unknown',
          total: entry.totalPrice,
          date: format(new Date(entry.date), 'yyyy-MM-dd HH:mm')
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