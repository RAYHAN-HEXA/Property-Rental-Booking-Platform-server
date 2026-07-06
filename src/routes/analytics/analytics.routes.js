import express from 'express';
import Property from '../../models/propertyModel.js';
import Booking from '../../models/bookingModel.js';
import User from '../../models/userModel.js';
import Transaction from '../../models/transactionModel.js';
import Review from '../../models/reviewModel.js';
import Favorite from '../../models/favoriteModel.js';
import verifyToken from '../../middlewares/verifyToken.js';
import verifyAdmin from '../../middlewares/verifyAdmin.js';

const router = express.Router();

// Get owner analytics
router.get('/owner/:email', verifyToken, async (req, res) => {
  try {
    const ownerEmail = req.params.email;

    // Get owner's properties
    const properties = await Property.find({ ownerEmail }).lean();
    const propertyIds = properties.map(p => p._id);

    // Get bookings for owner's properties
    const bookings = await Booking.find({
      propertyId: { $in: propertyIds },
      paymentStatus: 'Paid'
    }).lean();

    // Calculate total earnings
    const totalEarnings = bookings.reduce((sum, b) => sum + b.amount, 0);

    res.json({
      totalEarnings,
      totalProperties: properties.length,
      totalBookings: bookings.length
    });
  } catch (error) {
    console.error('Owner analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get owner monthly earnings (last 12 months)
router.get('/owner/monthly-earnings/:email', verifyToken, async (req, res) => {
  try {
    const ownerEmail = req.params.email;

    // Get owner's properties
    const properties = await Property.find({ ownerEmail }).lean();
    const propertyIds = properties.map(p => p._id);

    // Get transactions for owner's properties
    const transactions = await Transaction.find({
      ownerEmail,
      date: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } // Last 12 months
    }).lean();

    // Group by month
    const monthlyData = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 1);

      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= monthStart && tDate < monthEnd;
      });

      const earnings = monthTransactions.reduce((sum, t) => sum + t.amount, 0);

      monthlyData.push({
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        earnings
      });
    }

    res.json(monthlyData);
  } catch (error) {
    console.error('Monthly earnings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get admin analytics
router.get('/admin', verifyAdmin, async (req, res) => {
  try {
    const [totalUsers, totalProperties, totalBookings, totalTransactions] = await Promise.all([
      User.countDocuments(),
      Property.countDocuments(),
      Booking.countDocuments(),
      Transaction.countDocuments()
    ]);

    // Calculate total revenue from transactions
    const transactions = await Transaction.find().lean();
    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);

    // Get bookings by status
    const [pendingBookings, approvedBookings, rejectedBookings] = await Promise.all([
      Booking.countDocuments({ bookingStatus: 'Pending' }),
      Booking.countDocuments({ bookingStatus: 'Approved' }),
      Booking.countDocuments({ bookingStatus: 'Rejected' })
    ]);

    // Get properties by status
    const [pendingProperties, approvedProperties, rejectedProperties] = await Promise.all([
      Property.countDocuments({ status: 'Pending' }),
      Property.countDocuments({ status: 'Approved' }),
      Property.countDocuments({ status: 'Rejected' })
    ]);

    res.json({
      totalUsers,
      totalProperties,
      totalBookings,
      totalTransactions,
      totalRevenue,
      pendingBookings,
      approvedBookings,
      rejectedBookings,
      pendingProperties,
      approvedProperties,
      rejectedProperties
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tenant analytics
router.get('/tenant/:email', verifyToken, async (req, res) => {
  try {
    const tenantEmail = req.params.email;

    const [totalBookings, totalFavorites, bookings] = await Promise.all([
      Booking.countDocuments({ tenantEmail }),
      Favorite.countDocuments({ tenantEmail }),
      Booking.find({ tenantEmail, paymentStatus: 'Paid' }).lean()
    ]);

    const totalSpent = bookings.reduce((sum, b) => sum + b.amount, 0);

    res.json({
      totalBookings,
      totalFavorites,
      totalSpent
    });
  } catch (error) {
    console.error('Tenant analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
