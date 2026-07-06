import express from 'express';
import Booking from '../../models/bookingModel.js';
import Property from '../../models/propertyModel.js';
import verifyToken from '../../middlewares/verifyToken.js';
import verifyOwner from '../../middlewares/verifyOwner.js';
import verifyAdmin from '../../middlewares/verifyAdmin.js';

const router = express.Router();

// Create booking (after payment)
router.post('/', verifyToken, async (req, res) => {
  try {
    const booking = new Booking({
      ...req.body,
      tenantName: req.user.name,
      tenantEmail: req.user.email
    });

    await booking.save();

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tenant's bookings
router.get('/tenant/:email', verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ tenantEmail: req.params.email })
      .sort({ createdAt: -1 })
      .lean();

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get owner's booking requests
router.get('/owner/:email', verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ ownerEmail: req.params.email })
      .sort({ createdAt: -1 })
      .lean();

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all bookings (Admin only)
router.get('/all', verifyAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve booking (Owner only)
router.patch('/approve/:id', verifyOwner, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if booking belongs to owner's property
    if (booking.ownerEmail !== req.user.email) {
      return res.status(403).json({ message: 'Not authorized to approve this booking' });
    }

    booking.bookingStatus = 'Approved';
    await booking.save();

    res.json({
      message: 'Booking approved successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject booking (Owner only)
router.patch('/reject/:id', verifyOwner, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if booking belongs to owner's property
    if (booking.ownerEmail !== req.user.email) {
      return res.status(403).json({ message: 'Not authorized to reject this booking' });
    }

    booking.bookingStatus = 'Rejected';
    await booking.save();

    res.json({
      message: 'Booking rejected',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single booking
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).lean();

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
