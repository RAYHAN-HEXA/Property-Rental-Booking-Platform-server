# Deployment Guide - Vercel

This guide covers deploying the Property Rental Server to Vercel.

## Prerequisites

- Node.js 18+
- MongoDB Atlas account (for cloud database)
- Stripe account (for payments)
- Vercel account
- GitHub account

## 1. Database Setup (MongoDB Atlas)

### Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (Free tier: M0)
4. In **Database Access**, create a database user:
   - Username: `property-rental-admin`
   - Password: (generate strong password)
5. In **Network Access**, whitelist IP `0.0.0.0/0` (allows all IPs)
6. Get your connection string from **Connect** → **Connect your application**

### Connection String Format

```
mongodb+srv://property-rental-admin:PASSWORD@cluster.mongodb.net/property-rental?retryWrites=true&w=majority
```

## 2. Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your API keys from **Developers** → **API keys**
3. Copy the **Secret key** (starts with `sk_test_` for test mode)

## 3. Vercel Deployment

### Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add STRIPE_SECRET_KEY
vercel env add CLIENT_URL

# Deploy to production
vercel --prod
```

### Via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import repository: `RAYHAN-HEXA/Property-Rental-Booking-Platform-server`
3. Configure Project:
   - **Project Name**: `property-rental-server`
   - **Framework Preset**: Node.js
   - **Root Directory**: `./`
4. Add Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   STRIPE_SECRET_KEY=sk_test_...
   CLIENT_URL=https://your-frontend-domain.com
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=secure-admin-password
   ```
5. Click **Deploy**

## 4. Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB Atlas connection string | ✅ Yes |
| `JWT_SECRET` | Secret key for JWT tokens (min 32 chars) | ✅ Yes |
| `STRIPE_SECRET_KEY` | Stripe API secret key | ✅ Yes |
| `CLIENT_URL` | Frontend URL for CORS | ✅ Yes |
| `PORT` | Server port (default: 5000) | ❌ No |
| `NODE_ENV` | Environment (production) | ❌ No |
| `ADMIN_EMAIL` | Admin email for seeding | ❌ No |
| `ADMIN_PASSWORD` | Admin password for seeding | ❌ No |

## 5. Post-Deployment

### Test Your Deployment

```bash
# Health check
curl https://your-app.vercel.app/

# Test API endpoint
curl https://your-app.vercel.app/properties
```

### Set Custom Domain

1. Go to **Vercel Dashboard** → **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed

### Monitor Deployment

- Check **Vercel Dashboard** for deployment logs
- Monitor **MongoDB Atlas** for database metrics
- Review **Stripe Dashboard** for payment activity

## 6. Troubleshooting

### Database Connection Issues

- Ensure IP whitelist includes `0.0.0.0/0`
- Check username/password in connection string
- Verify database user has correct permissions

### CORS Errors

- Ensure `CLIENT_URL` matches your frontend domain exactly
- Include protocol (`https://`) and port if needed

### Payment Issues

- Verify Stripe key is correct (test vs live mode)
- Check Stripe webhook endpoints in dashboard

## 7. Security Checklist

- [ ] Use strong, unique passwords for MongoDB
- [ ] Use secure JWT_SECRET (min 32 characters)
- [ ] Enable MongoDB Atlas security features
- [ ] Use HTTPS for all connections
- [ ] Rotate API keys regularly
- [ ] Monitor logs for suspicious activity
