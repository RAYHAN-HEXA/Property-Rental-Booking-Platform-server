# Quick Setup Guide - Property Rental Server

Follow this guide to set up and deploy your server.

## 1. MongoDB Atlas Setup (2 minutes)

```
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create free M0 cluster
4. Create database user with password
5. Network Access → Whitelist: 0.0.0.0/0
6. Get connection string from "Connect" button
```

**Your connection string will look like:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/property-rental
```

## 2. Stripe Setup (1 minute)

```
1. Go to https://dashboard.stripe.com/register
2. Get API keys from Developers → API keys
3. Copy "Secret key" (starts with sk_test_)
```

## 3. Vercel Deployment (3 minutes)

### Option A: Deploy from Dashboard (Easiest)

```
1. Visit https://vercel.com/new
2. Click "Import" from Git
3. Select: RAYHAN-HEXA/Property-Rental-Booking-Platform-server
4. Configure:
   - Framework: Node.js
   - Root Directory: ./
5. Add Environment Variables:
   MONGODB_URI = (your MongoDB connection string)
   JWT_SECRET = (generate random 32+ char string)
   STRIPE_SECRET_KEY = (your Stripe key)
   CLIENT_URL = https://your-frontend-url.com
6. Click "Deploy"
```

### Option B: Deploy from CLI

```bash
# Install and login
npm i -g vercel
vercel login

# Deploy
vercel

# Add environment variables
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add STRIPE_SECRET_KEY
vercel env add CLIENT_URL

# Deploy to production
vercel --prod
```

## 4. Generate JWT Secret

```bash
# macOS/Linux
openssl rand -base64 32

# Or use an online generator:
# https://www.uuidgenerator.net/api/guid
```

## 5. Verify Deployment

```bash
# Test health endpoint
curl https://your-app.vercel.app/health

# Expected response:
{
  "status": "healthy",
  "environment": "production",
  "checks": {
    "api": "ok",
    "database": "configured"
  }
}
```

## 6. Frontend Configuration

Update your frontend `.env` file:

```env
VITE_API_URL=https://your-app.vercel.app
```

## Environment Variables Checklist

| Variable | Example | Required |
|----------|---------|----------|
| MONGODB_URI | mongodb+srv://user:pass@cluster... | ✅ |
| JWT_SECRET | abc123xyz...(32+ chars) | ✅ |
| STRIPE_SECRET_KEY | sk_test_51M... | ✅ |
| CLIENT_URL | https://myapp.vercel.app | ✅ |

## Common Issues

**Database connection fails:**
- Check MongoDB Atlas → Network Access has 0.0.0.0/0 whitelisted
- Verify username/password in connection string

**CORS errors:**
- Ensure CLIENT_URL matches your frontend exactly (including https://)

**Stripe errors:**
- Verify you're using test mode keys for development
- Check key starts with sk_test_ not sk_live_

## Need Help?

- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guide
- Review [README.md](./README.md) for API documentation
- Check Vercel deployment logs for errors
