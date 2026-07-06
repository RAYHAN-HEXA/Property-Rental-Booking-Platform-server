import express from 'express';
import Transaction from '../../models/transactionModel.js';
import verifyToken from '../../middlewares/verifyToken.js';
import verifyAdmin from '../../middlewares/verifyAdmin.js';

const router = express.Router();

// GET /transactions - Get all transactions (Admin only)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const total = await Transaction.countDocuments();
    const transactions = await Transaction.find()
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get Transactions Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
