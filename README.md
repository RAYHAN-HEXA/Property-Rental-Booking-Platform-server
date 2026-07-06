# Property Rental & Booking Platform - Server

Backend API for the Property Rental & Booking Platform.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-brightgreen.svg)](https://mongodb.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

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

## Installation

```bash
cd server
npm install
```

## Running the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Database Seeding

To seed the database with sample data:

```bash
npm run seed
```

## Default Admin Credentials

After seeding, you can login with:
- Email: admin@example.com
- Password: admin123

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
