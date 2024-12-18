const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const History = require('../models/History');
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

    // Add user metrics aggregation
    const userMetrics = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const orderMetrics = await History.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $group: {
          _id: '$user.role',
          orders: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      }
    ]);

    // Format the user metrics
    const formattedUserMetrics = {
      regularUsers: userMetrics.find(m => m._id === 'user')?.count || 0,
      facultyUsers: userMetrics.find(m => m._id === 'faculty')?.count || 0,
      regularOrders: orderMetrics.find(m => m._id === 'user')?.orders || 0,
      facultyOrders: orderMetrics.find(m => m._id === 'faculty')?.orders || 0,
      regularRevenue: orderMetrics.find(m => m._id === 'user')?.revenue || 0,
      facultyRevenue: orderMetrics.find(m => m._id === 'faculty')?.revenue || 0,
    };

    // Get recent activity
    const recentHistory = await History.find()
      .sort({ date: -1 })
      .limit(10)
      .populate('userId', 'name course year role');

    // Add low stock query
    const lowStockItems = await Food.find({
      quantity: { $lte: 20 } // Assuming items with 20 or fewer units are considered low stock
    }).select('name quantity price category');

    // Add time-based metrics based on range
    let timeMetrics = {};
    
    switch (range) {
      case 'today':
        // Hourly breakdown for today
        timeMetrics = await History.aggregate([
          {
            $match: {
              date: { 
                $gte: startOfDay(today),
                $lte: endOfDay(today)
              }
            }
          },
          {
            $group: {
              _id: { $hour: '$date' },
              revenue: { $sum: '$totalPrice' },
              orders: { $sum: 1 }
            }
          },
          {
            $sort: { _id: 1 }
          }
        ]);
        break;
        
      case 'week':
        // Daily breakdown for week
        timeMetrics = await History.aggregate([
          {
            $match: {
              date: { 
                $gte: startOfWeek(today),
                $lte: endOfWeek(today)
              }
            }
          },
          {
            $group: {
              _id: { $dayOfWeek: '$date' },
              revenue: { $sum: '$totalPrice' },
              orders: { $sum: 1 }
            }
          },
          {
            $sort: { _id: 1 }
          }
        ]);
        break;
        
      case 'month':
        // Weekly breakdown for month
        timeMetrics = await History.aggregate([
          {
            $match: {
              date: { 
                $gte: startOfMonth(today),
                $lte: endOfMonth(today)
              }
            }
          },
          {
            $group: {
              _id: { $week: '$date' },
              revenue: { $sum: '$totalPrice' },
              orders: { $sum: 1 }
            }
          },
          {
            $sort: { _id: 1 }
          }
        ]);
        break;
        
      case 'year':
        // Monthly breakdown for year
        timeMetrics = await History.aggregate([
          {
            $match: {
              date: { 
                $gte: startOfYear(today),
                $lte: endOfDay(today)
              }
            }
          },
          {
            $group: {
              _id: { $month: '$date' },
              revenue: { $sum: '$totalPrice' },
              orders: { $sum: 1 }
            }
          },
          {
            $sort: { _id: 1 }
          }
        ]);
        break;
    }

    // Process time metrics into arrays
    const processedMetrics = {
      revenueMetrics: {
        hourly: new Array(24).fill(0),
        daily: new Array(7).fill(0),
        weekly: new Array(4).fill(0),
        monthly: new Array(12).fill(0)
      },
      historyMetrics: {
        hourly: new Array(24).fill(0),
        daily: new Array(7).fill(0),
        weekly: new Array(4).fill(0),
        monthly: new Array(12).fill(0)
      }
    };

    timeMetrics.forEach(metric => {
      switch (range) {
        case 'today':
          processedMetrics.revenueMetrics.hourly[metric._id] = metric.revenue;
          processedMetrics.historyMetrics.hourly[metric._id] = metric.orders;
          break;
        case 'week':
          // Adjust for MongoDB's day of week (1-7, Sunday = 1) to array index (0-6)
          const dayIndex = metric._id - 1;
          processedMetrics.revenueMetrics.daily[dayIndex] = metric.revenue;
          processedMetrics.historyMetrics.daily[dayIndex] = metric.orders;
          break;
        case 'month':
          // Get week number within month (0-3)
          const weekIndex = Math.min(3, Math.floor((metric._id % 4)));
          processedMetrics.revenueMetrics.weekly[weekIndex] = metric.revenue;
          processedMetrics.historyMetrics.weekly[weekIndex] = metric.orders;
          break;
        case 'year':
          // Month is 1-based in MongoDB
          const monthIndex = metric._id - 1;
          processedMetrics.revenueMetrics.monthly[monthIndex] = metric.revenue;
          processedMetrics.historyMetrics.monthly[monthIndex] = metric.orders;
          break;
      }
    });

    res.json({
      revenueMetrics: {
        ...processedMetrics.revenueMetrics,
        total: totalRevenue,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
      },
      historyMetrics: {
        ...processedMetrics.historyMetrics,
        total: totalOrders
      },
      userMetrics: formattedUserMetrics,
      recentActivity: {
        history: recentHistory
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