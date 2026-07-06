import express from 'express';
import Review from '../../models/reviewModel.js';
import Booking from '../../models/bookingModel.js';
import verifyToken from '../../middlewares/verifyToken.js';
import verifyTenant from '../../middlewares/verifyTenant.js';

const router = express.Router();

// Create review (Tenant only, must have booked the property)
router.post('/', verifyTenant, async (req, res) => {
  try {
    const { propertyId, rating, comment } = req.body;

    if (!propertyId || !rating || !comment) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if user has booked this property
    const hasBooked = await Booking.findOne({
      propertyId,
      tenantEmail: req.user.email,
      paymentStatus: 'Paid'
    });

    if (!hasBooked) {
      return res.status(403).json({ message: 'You must have booked this property to leave a review' });
    }

    // Check if user already reviewed this property
    const existingReview = await Review.findOne({
      propertyId,
      tenantEmail: req.user.email
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this property' });
    }

    const review = new Review({
      propertyId,
      tenantName: req.user.name,
      tenantEmail: req.user.email,
      rating,
      comment
    });

    await review.save();

    res.status(201).json({
      message: 'Review added successfully',
      review
    });
  } catch (error) {
    console.error('Review creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all reviews
router.get('/', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reviews by property
router.get('/property/:propertyId', async (req, res) => {
  try {
    const reviews = await Review.find({ propertyId: req.params.propertyId })
      .sort({ createdAt: -1 })
      .lean();

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
