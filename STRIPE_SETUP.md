# Stripe Setup Guide - Step by Step

## 💳 Creating Your Stripe Account

### Step 1: Sign Up
1. Visit **https://dashboard.stripe.com/register**
2. Sign up with:
   - Email address
   - Country (where your business is located)
   - Business details

### Step 2: Complete Account Setup
After signing up:

1. **Business Type**: Select "Individual" or "Company"
2. **Business Details**:
   - Business name
   - Business type/industry
   - Website URL (can use placeholder for now)
3. **Bank Account** (optional for test mode)
   - You can skip this initially
   - Needed for receiving payouts later

### Step 3: Get Your API Keys

1. While in Test Mode (toggle in top-left corner)
2. Navigate to **Developers** → **API keys** (left sidebar)
3. You'll see two sets of keys:

**Test Mode Keys (starts with sk_test_)**
```
Publishable key: pk_test_51xxxxxxxxxxxxxxx
Secret key: sk_test_51xxxxxxxxxxxxxxx
```

**Live Mode Keys (starts with sk_live_)**
```
Publishable key: pk_live_51xxxxxxxxxxxxxxx
Secret key: sk_live_51xxxxxxxxxxxxxxx
```

### Step 4: Copy Your Secret Key

1. Click the eye icon to reveal the **Secret key**
2. Copy the key that starts with `sk_test_`
3. **⚠️ NEVER share your secret key or commit it to git!**

## 🔧 Environment Configuration

### Add to Environment Variables

**For Local Development (.env)**
```env
STRIPE_SECRET_KEY=sk_test_51YourTestKeyHere...
STRIPE_WEBHOOK_SECRET=whsec_xxx (for webhooks)
```

**For Production (Vercel)**
```env
STRIPE_SECRET_KEY=sk_live_51YourLiveKeyHere...
```

## 🧪 Testing in Test Mode

### Create a Test Payment Intent

Using Stripe CLI or API:

```javascript
// Create a test payment
const paymentIntent = await stripe.paymentIntents.create({
  amount: 5000, // $50.00 in cents
  currency: 'usd',
  payment_method_types: ['card'],
});

console.log(paymentIntent.client_secret);
```

### Test Card Numbers

Stripe provides test card numbers for testing:

| Card Type | Number | CVC | Description |
|-----------|--------|-----|-------------|
| Visa | 4242 4242 4242 4242 | Any 3 digits | Successful payment |
| Visa (debit) | 4000 0000 0000 0002 | Any 3 digits | Successful payment |
| Declined | 4000 0000 0000 0002 | Any 3 digits | Card declined |
| Insufficient Funds | 4000 0000 0000 9995 | Any 3 digits | Insufficient funds |
| Expired Card | 4000 0000 0000 0069 | Any 3 digits | Expired card |

**Test Expiry Date:** Any future date (e.g., 12/34)
**Test Postal Code:** Any 5-digit code (e.g., 12345)

## 🔄 Webhook Setup (Optional but Recommended)

Webhooks allow Stripe to notify your server of payment events.

### Step 1: Install Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop bucket add stripe
scoop install stripe

# Linux
curl -s https://packages.stripe.com/api/security/gpg/public | gpg --dearmor > /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.com/stripe-cli-debian-local stable main" | sudo tee -etc/apt/sources.list.d/stripe.list
sudo apt-get update && sudo apt-get install stripe
```

### Step 2: Login to Stripe

```bash
stripe login
```

This will open a browser to authenticate.

### Step 3: Forward Webhooks Locally

```bash
stripe listen --forward-to localhost:5000/payments/webhook
```

This gives you a webhook signing secret:
```
whsec_1234567890abcdef...
```

### Step 4: Test Webhook Events

```bash
# Trigger a test payment
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
```

## 🚀 Production Checklist

Before going live:

- [ ] Switch from Test to Live mode
- [ ] Update `STRIPE_SECRET_KEY` with live key
- [ ] Add bank account for payouts
- [ ] Set up production webhooks
- [ ] Update business information
- [ ] Enable fraud protection (Radar)
- [ ] Configure email receipts
- [ ] Set up tax calculation (if needed)

## 📊 Dashboard Features

### Monitor Your Payments

**Dashboard Pages:**
- **Payments**: View all transactions
- **Balance**: Current balance and pending payouts
- **Customers**: Customer information
- **Products**: Products and pricing
- **Reports**: Financial reports

### Common Dashboard Actions

1. **Refund a payment:**
   - Payments → Select payment → Refund

2. **View customer details:**
   - Customers → Select customer

3. **Export transactions:**
   - Payments → Export

## 🛡️ Security Best Practices

1. ✅ **Never commit secret keys to git**
2. ✅ **Use environment variables for all keys**
3. ✅ **Enable two-factor authentication**
4. ✅ **Regularly rotate API keys**
5. ✅ **Use webhook signatures to verify events**
6. ✅ **Log errors but never log full API keys**

## 💡 Integration with Your API

### Payment Flow

1. **Frontend** requests payment intent from your API
2. **Your server** creates payment intent via Stripe
3. **Frontend** confirms payment using Stripe.js
4. **Stripe** processes the payment
5. **Webhook** notifies your server of payment status

### Code Example

```javascript
// Create payment intent
POST /payments/create-payment-intent
{
  "amount": 5000,
  "currency": "usd"
}

// Response
{
  "clientSecret": "pi_12345_secret_xxxxx"
}
```

## 🔍 Troubleshooting

### "Invalid API Key"
- Verify key starts with `sk_test_` or `sk_live_`
- Check for extra spaces in environment variable
- Ensure you're using Secret key, not Publishable key

### "Payment Failed"
- Check card number is valid test card
- Verify card expiry is in future
- Ensure amount is in cents (not dollars)

### "Webhook Verification Failed"
- Ensure webhook secret is correct
- Check timestamp is within tolerance
- Verify signature is computed correctly

## 📝 Environment Variables Summary

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxxxxxxxx (for frontend)
```

## 🔗 Useful Links

| Resource | Link |
|----------|------|
| Stripe Dashboard | https://dashboard.stripe.com |
| API Documentation | https://stripe.com/docs/api |
| Test Cards | https://stripe.com/docs/testing |
| Webhooks Guide | https://stripe.com/docs/webhooks |
| CLI Reference | https://stripe.com/docs/stripe-cli |

## 💳 Stripe Account Types

| Feature | Test Mode | Live Mode |
|---------|-----------|-----------|
| Process real payments | ❌ No | ✅ Yes |
| Use test cards | ✅ Yes | ❌ No |
| View analytics | ✅ Yes | ✅ Yes |
| Webhooks | ✅ Yes | ✅ Yes |
| Real bank transfers | ❌ No | ✅ Yes |
