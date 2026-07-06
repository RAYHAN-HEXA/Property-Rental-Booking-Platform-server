# Property Rental & Booking Platform - Server

Backend API for the Property Rental & Booking Platform.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-brightgreen.svg)](https://mongodb.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**🚀 Quick Links:**
- [Setup Guide](#quick-setup) - Get started in 5 minutes
- [MongoDB Atlas Setup](./MONGODB_SETUP.md) - Database configuration step-by-step
- [Deployment Guide](./DEPLOYMENT.md) - Full deployment documentation
- [API Documentation](#api-endpoints) - Available endpoints

[![Deploy](https://vercel.com/button)](https://vercel.com/new)

**🌐 Deployed Server:** https://property-rental-server-alpha.vercel.app

**📚 Setup Guides:**
- [🍃 MongoDB Atlas Setup](./MONGODB_SETUP.md) - Step-by-step database setup
- [💳 Stripe Setup](./STRIPE_SETUP.md) - Payment gateway configuration
- [💰 Payment Integration Guide](./src/docs/PAYMENT_FLOW.md) - Payment flow documentation
- [⚙️ Environment Variables](./.env.production.example) - Configuration template
- [🚀 Vercel Deployment](./DEPLOYMENT.md) - Deployment guide

## Features

- JWT authentication with role-based access control
- Property management with approval workflow
- Booking management with owner approval
- Stripe payment integration
- Favorite properties for tenants
- Review system
- Analytics for owners and admins
- User role management

## Technologies

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- Stripe API
- CORS support

## API Endpoints

### Authentication
- `POST /jwt` - Generate JWT token
- `GET /users/:email` - Get user by email
- `PATCH /users/role/:id` - Update user role (Admin only)

### Properties
- `POST /properties` - Create property (Owner only)
- `GET /properties` - Get approved properties with search/filter/sort/pagination
- `GET /properties/featured` - Get 6 featured properties
- `GET /properties/:id` - Get single property
- `GET /owner/properties/:email` - Get owner's properties
- `PATCH /properties/:id` - Update property
- `DELETE /properties/:id` - Delete property
- `PATCH /properties/approve/:id` - Approve property (Admin only)
- `PATCH /properties/reject/:id` - Reject property with feedback (Admin only)

### Bookings
- `POST /bookings` - Create booking
- `GET /bookings/tenant/:email` - Get tenant's bookings
- `GET /bookings/owner/:email` - Get bookings for owner's properties
- `GET /bookings/all` - Get all bookings (Admin only)
- `PATCH /bookings/approve/:id` - Approve booking (Owner only)
- `PATCH /bookings/reject/:id` - Reject booking (Owner only)

### Payments
- `POST /payments/create-payment-intent` - Create Stripe payment intent
- `POST /payments/success` - Handle successful payment

### Favorites
- `POST /favorites` - Add to favorites (Tenant only)
- `GET /favorites/:email` - Get user's favorites
- `DELETE /favorites/:id` - Remove favorite

### Reviews
- `POST /reviews` - Add review (Tenant only)
- `GET /reviews` - Get all reviews
- `GET /reviews/property/:propertyId` - Get property reviews

### Analytics
- `GET /analytics/owner/:email` - Get owner dashboard stats
- `GET /analytics/owner/monthly-earnings/:email` - Get monthly earnings for chart
- `GET /analytics/admin` - Get admin dashboard stats
- `GET /analytics/tenant/:email` - Get tenant dashboard stats

## Environment Variables

Create a `.env` file in the server directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/property-rental
JWT_SECRET=your_jwt_secret_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
CLIENT_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

## Quick Setup

Get your server running in 5 minutes with [SETUP.md](./SETUP.md) or follow these steps:

### 1. Clone & Install

```bash
git clone https://github.com/RAYHAN-HEXA/Property-Rental-Booking-Platform-server.git
cd Property-Rental-Booking-Platform-server
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Run Locally

```bash
npm run dev
```

### 4. Deploy to Vercel

```bash
npm i -g vercel
vercel login
vercel
```

## Installation

## Running the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Vercel Deployment

This project is configured for Vercel deployment.

### Quick Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod
```

### Environment Variables on Vercel

Set these in your Vercel project settings:

- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Your JWT secret key
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `CLIENT_URL` - Your frontend URL

## Database Seeding

To seed the database with sample data:

```bash
npm run seed
```

## Default Admin Credentials

After seeding, you can login with:
- Email: admin@example.com
- Password: admin123

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Models

### User
- name, email, photo, role (Tenant/Owner/Admin)

### Property
- title, description, location, propertyType, rent, rentType
- bedrooms, bathrooms, propertySize
- amenities, images, extraFeatures
- status (Pending/Approved/Rejected), rejectionFeedback
- ownerName, ownerEmail, ownerPhoto

### Booking
- propertyId, propertyTitle, propertyLocation
- tenantName, tenantEmail, ownerEmail
- moveInDate, contactNumber, additionalNotes, amount
- bookingStatus (Pending/Approved/Rejected)
- paymentStatus (Pending/Paid/Failed), transactionId

### Favorite
- propertyId, tenantEmail, propertyInfo snapshot

### Review
- propertyId, tenantName, tenantEmail, rating, comment

### Transaction
- transactionId, propertyId, propertyName
- tenantName, tenantEmail, ownerName, ownerEmail, amount, date
