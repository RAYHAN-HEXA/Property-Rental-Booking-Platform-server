import express from 'express';
import crypto from 'crypto';
import stripe from 'stripe';
import Property from '../../models/propertyModel.js';
import Booking from '../../models/bookingModel.js';
import Transaction from '../../models/transactionModel.js';
import verifyToken from '../../middlewares/verifyToken.js';

const router = express.Router();

// Initialize Stripe (lazy - env vars available after dotenv.config)
let stripeInstance;
function getStripe() {
  if (!stripeInstance) {
    stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeInstance;
}

// Create payment intent
router.post('/create-payment-intent', verifyToken, async (req, res) => {
  try {
    const { propertyId, amount } = req.body;

    if (!propertyId || !amount) {
      return res.status(400).json({ message: 'Property ID and amount are required' });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Create payment intent with Stripe
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        propertyId,
        tenantEmail: req.user.email,
        ownerEmail: property.ownerEmail
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount,
      propertyId
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Payment success handler
router.post('/success', verifyToken, async (req, res) => {
  try {
    const {
      paymentIntentId,
      propertyId,
      moveInDate,
      contactNumber,
      additionalNotes
    } = req.body;

    if (!paymentIntentId || !propertyId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify payment intent with Stripe
    const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not successful' });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Generate transaction ID
    const transactionId = 'TXN-' + crypto.randomBytes(16).toString('hex').toUpperCase();

    // Create booking
    const booking = new Booking({
      propertyId,
      propertyTitle: property.title,
      propertyLocation: property.location,
      tenantName: req.user.name,
      tenantEmail: req.user.email,
      ownerEmail: property.ownerEmail,
      moveInDate,
      contactNumber,
      additionalNotes: additionalNotes || '',
      amount: paymentIntent.amount / 100, // Convert from cents
      bookingStatus: 'Pending',
      paymentStatus: 'Paid',
      transactionId
    });

    await booking.save();

    // Save transaction
    const transaction = new Transaction({
      transactionId,
      propertyId,
      propertyName: property.title,
      tenantName: req.user.name,
      tenantEmail: req.user.email,
      ownerName: property.ownerName,
      ownerEmail: property.ownerEmail,
      amount: paymentIntent.amount / 100
    });

    await transaction.save();

    res.json({
      message: 'Payment successful',
      booking,
      transaction
    });
  } catch (error) {
    console.error('Payment success error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

export default router;
