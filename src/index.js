import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth/auth.routes.js';
import propertyRoutes from './routes/properties/property.routes.js';
import bookingRoutes from './routes/bookings/booking.routes.js';
import paymentRoutes from './routes/payments/payment.routes.js';
import reviewRoutes from './routes/reviews/review.routes.js';
import favoriteRoutes from './routes/favorites/favorite.routes.js';
import analyticsRoutes from './routes/analytics/analytics.routes.js';
import transactionRoutes from './routes/transactions/transaction.routes.js';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check route
app.get('/', (req, res) => {
  res.json({
    message: 'Property Rental API is running',
    status: 'active',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Detailed health check for monitoring
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    },
    checks: {
      api: 'ok',
      database: process.env.MONGODB_URI ? 'configured' : 'missing'
    }
  };
  res.json(health);
});

// API Routes
app.use('/jwt', authRoutes);
app.use('/users', authRoutes);
app.use('/properties', propertyRoutes);
app.use('/bookings', bookingRoutes);
app.use('/payments', paymentRoutes);
app.use('/reviews', reviewRoutes);
app.use('/favorites', favoriteRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/transactions', transactionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    status: err.status || 500
  });
});

// Start server only if not running in Vercel
if (process.env.NODE_ENV !== 'vercel') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

export default app;
