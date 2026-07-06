# Payment Integration Guide - Property Rental Platform

## 💳 Payment Flow Overview

This guide explains how payments work in the Property Rental & Booking Platform.

## 🔄 Complete Payment Flow

### Step 1: Tenant Initiates Booking
```
Frontend → POST /payments/create-payment-intent
↓
Server → Creates Stripe PaymentIntent
↓
Stripe → Returns client_secret
↓
Server → Returns { clientSecret } to frontend
```

### Step 2: Tenant Confirms Payment
```
Frontend → Stripe.js confirms payment
↓
Stripe → Processes payment
↓
Stripe → Returns payment result
```

### Step 3: Webhook Updates Booking
```
Stripe → Sends webhook event
↓
Server /payments/webhook → Verifies signature
↓
Server → Updates booking payment_status
↓
Server → Creates transaction record
```

### Step 4: Booking Completed
```
Frontend → GET /bookings/tenant/:email
↓
Server → Returns booking with payment_status: "Paid"
```

## 📋 API Endpoints

### 1. Create Payment Intent
```http
POST /payments/create-payment-intent
Content-Type: application/json

{
  "bookingId": "booking_123",
  "amount": 5000,
  "currency": "usd"
}

Response:
{
  "clientSecret": "pi_12345_secret_xxxxx",
  "paymentIntentId": "pi_12345"
}
```

### 2. Payment Success Handler
```http
POST /payments/success
Content-Type: application/json

{
  "paymentIntentId": "pi_12345",
  "bookingId": "booking_123"
}

Response:
{
  "message": "Payment recorded successfully",
  "booking": { ... }
}
```

### 3. Payment Webhook
```http
POST /payments/webhook
Stripe-Signature: t=timestamp,v1=signature

Body: Stripe event JSON

Response:
{
  "received": true
}
```

## 🔒 Security Considerations

### 1. Never Expose Secret Key
```javascript
// ❌ BAD - Never do this
const stripe = require('stripe')('sk_test_...');

// ✅ GOOD - Use environment variable
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
```

### 2. Verify Webhook Signatures
```javascript
const signature = request.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

### 3. Validate Amounts Server-Side
```javascript
// Always calculate amount on server
const booking = await Booking.findById(bookingId);
const amount = booking.amount; // From database, not client
```

## 💰 Amount Calculation

### Booking Amount Breakdown

```javascript
// Property rent calculation
const monthlyRent = property.rent; // e.g., $1200
const bookingMonths = calculateMonths(moveInDate);
const totalAmount = monthlyRent * bookingMonths;

// Convert to cents for Stripe
const amountInCents = totalAmount * 100;
```

### Example

```
Property Rent: $1,200/month
Booking Duration: 6 months
Total Amount: $7,200
Stripe Amount: 720000 (cents)
```

## 🧪 Testing Payments

### Using Test Cards

```javascript
// Frontend - Stripe.js
const { error, paymentIntent } = await stripe.confirmCardPayment(
  clientSecret,
  {
    payment_method: {
      card: elements.getElement(CardElement),
      billing_details: { name: 'Test User' }
    }
  }
);
```

### Test Card Numbers

| Scenario | Card Number | Result |
|----------|-------------|--------|
| Successful payment | 4242 4242 4242 4242 | ✅ Success |
| Card declined | 4000 0000 0000 0002 | ❌ Declined |
| Insufficient funds | 4000 0000 0000 9995 | ❌ Insufficient funds |
| Expired card | 4000 0000 0000 0069 | ❌ Expired |

## 📊 Transaction Record

When payment succeeds, a transaction is created:

```javascript
{
  transactionId: "txn_12345",
  propertyId: "prop_123",
  propertyName: "Downtown Apartment",
  tenantName: "John Doe",
  tenantEmail: "john@example.com",
  ownerName: "Jane Smith",
  ownerEmail: "owner@example.com",
  amount: 720000, // cents
  date: new Date(),
  status: "completed"
}
```

## 🔧 Environment Setup

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Optional: Stripe publishable key (for reference)
# Frontend should use this for Stripe.js
STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxxxxxx
```

## 🚨 Error Handling

### Common Payment Errors

| Error Code | Description | Solution |
|------------|-------------|----------|
| `card_declined` | Card was declined | Ask user to try different card |
| `insufficient_funds` | Not enough funds | User needs to use different payment method |
| `expired_card` | Card has expired | User needs updated card |
| `processing_error` | Temporary error | Retry the payment |
| `amount_too_large` | Amount exceeds limit | Contact Stripe for limit increase |

### Error Response Example

```javascript
{
  "error": {
    "message": "Your card was declined.",
    "code": "card_declined",
    "type": "card_error"
  }
}
```

## 📈 Analytics

### Payment Metrics to Track

- Total revenue per month
- Average booking value
- Payment success rate
- Common decline reasons
- Owner earnings

```javascript
// Analytics endpoint
GET /analytics/owner/:ownerId/monthly-earnings

Response:
[
  { month: "Jan", earnings: 12000 },
  { month: "Feb", earnings: 15000 },
  { month: "Mar", earnings: 18000 }
]
```

## 🔔 Webhook Events

### Important Events to Handle

| Event | Description | Action |
|-------|-------------|--------|
| `payment_intent.succeeded` | Payment successful | Update booking, create transaction |
| `payment_intent.payment_failed` | Payment failed | Update booking status |
| `charge.refunded` | Payment refunded | Update transaction status |

### Webhook Handler Example

```javascript
switch (event.type) {
  case 'payment_intent.succeeded':
    const paymentIntent = event.data.object;
    await handleSuccessfulPayment(paymentIntent);
    break;
  case 'payment_intent.payment_failed':
    const failedPayment = event.data.object;
    await handleFailedPayment(failedPayment);
    break;
}
```

## 💡 Best Practices

1. **Always calculate amounts on the server**
2. **Use webhook signatures for verification**
3. **Store transaction records for audits**
4. **Implement proper error handling**
5. **Never log full card details**
6. **Use test mode during development**
7. **Monitor Stripe dashboard for issues**

## 🔗 Related Documentation

- [Stripe Setup Guide](../STRIPE_SETUP.md)
- [Deployment Guide](../DEPLOYMENT.md)
- [API Documentation](../README.md#api-endpoints)
