/**
 * Stripe Utility Helper
 * Common functions for Stripe payment processing
 */

import Stripe from 'stripe';

// Initialize Stripe with secret key from environment
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

/**
 * Create a Payment Intent for booking payment
 * @param {number} amount - Amount in cents
 * @param {string} currency - Currency code (default: 'usd')
 * @param {object} metadata - Additional metadata (bookingId, etc.)
 * @returns {Promise<object>} Payment Intent with client secret
 */
export async function createPaymentIntent(amount, currency = 'usd', metadata = {}) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new Error(`Failed to create payment intent: ${error.message}`);
  }
}

/**
 * Retrieve Payment Intent by ID
 * @param {string} paymentIntentId - Payment Intent ID
 * @returns {Promise<object>} Payment Intent details
 */
export async function getPaymentIntent(paymentIntentId) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw new Error(`Failed to retrieve payment intent: ${error.message}`);
  }
}

/**
 * Confirm webhook signature and return event
 * @param {string} payload - Raw webhook payload
 * @param {string} signature - Stripe-Signature header
 * @returns {Promise<object>} Parsed Stripe event
 */
export function constructWebhookEvent(payload, signature) {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw new Error(`Invalid webhook signature: ${error.message}`);
  }
}

/**
 * Handle successful payment
 * @param {object} paymentIntent - Payment Intent object
 * @returns {object} Payment details
 */
export function handleSuccessfulPayment(paymentIntent) {
  return {
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: paymentIntent.status,
    metadata: paymentIntent.metadata,
    createdAt: new Date(paymentIntent.created * 1000),
  };
}

/**
 * Handle failed payment
 * @param {object} paymentIntent - Payment Intent object
 * @returns {object} Error details
 */
export function handleFailedPayment(paymentIntent) {
  const lastPaymentError = paymentIntent.last_payment_error;

  return {
    paymentIntentId: paymentIntent.id,
    error: {
      message: lastPaymentError?.message || 'Payment failed',
      code: lastPaymentError?.code,
      type: lastPaymentError?.type,
    },
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
  };
}

/**
 * Format amount for display (cents to currency)
 * @param {number} amount - Amount in cents
 * @param {string} currency - Currency code
 * @returns {string} Formatted amount
 */
export function formatAmount(amount, currency = 'usd') {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  });

  return formatter.format(amount / 100);
}

/**
 * Validate payment amount
 * @param {number} amount - Amount in cents
 * @returns {boolean} Valid amount
 */
export function isValidAmount(amount) {
  return (
    typeof amount === 'number' &&
    amount > 0 &&
    amount <= 99999999 && // Max $999,999.99
    Number.isInteger(amount)
  );
}

/**
 * Calculate Stripe fee (approximately)
 * @param {number} amount - Amount in cents
 * @returns {number} Estimated fee in cents
 */
export function calculateStripeFee(amount) {
  // Stripe fee: 2.9% + $0.30
  const percentageFee = Math.round(amount * 0.029);
  const fixedFee = 30; // $0.30 in cents
  return percentageFee + fixedFee;
}

/**
 * Calculate net amount after Stripe fees
 * @param {number} amount - Amount in cents
 * @returns {number} Net amount in cents
 */
export function calculateNetAmount(amount) {
  return amount - calculateStripeFee(amount);
}

/**
 * Convert currency amount to cents
 * @param {number} amount - Amount in dollars
 * @returns {number} Amount in cents
 */
export function toCents(amount) {
  return Math.round(amount * 100);
}

/**
 * Convert cents to currency amount
 * @param {number} cents - Amount in cents
 * @returns {number} Amount in dollars
 */
export function fromCents(cents) {
  return cents / 100;
}

/**
 * Test card numbers for different scenarios
 */
export const TEST_CARDS = {
  SUCCESS: '4242424242424242',
  DECLINED: '4000000000000002',
  INSUFFICIENT_FUNDS: '4000000000009995',
  EXPIRED: '4000000000000069',
  PROCESSING_ERROR: '4000000000000119',
};

/**
 * Test card details
 */
export function getTestCardDetails(type = 'SUCCESS') {
  return {
    number: TEST_CARDS[type] || TEST_CARDS.SUCCESS,
    exp_month: 12,
    exp_year: new Date().getFullYear() + 2,
    cvc: '123',
  };
}
