# Frontend Integration Guide

This guide helps you integrate your Property Rental Server API with your frontend application.

## 🌐 API Base URL

**Production:** `https://property-rental-server-alpha.vercel.app`

**Local Development:** `http://localhost:5000`

---

## 🔧 Environment Configuration

### React (Vite)

```env
# .env.local
VITE_API_URL=https://property-rental-server-alpha.vercel.app
```

### React (Create React App)

```env
# .env
REACT_APP_API_URL=https://property-rental-server-alpha.vercel.app
```

### Next.js

```env
# .env.local
NEXT_PUBLIC_API_URL=https://property-rental-server-alpha.vercel.app
```

### Vue (Vite)

```env
# .env.local
VITE_API_URL=https://property-rental-server-alpha.vercel.app
```

---

## 📦 API Client Setup

### Using Fetch API

```javascript
// api/config.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = {
  async get(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  },

  async post(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  },

  async patch(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  },

  async delete(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  },

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Add auth token if exists
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  },

  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'An error occurred',
      }));
      throw new Error(error.message || 'Request failed');
    }
    return response.json();
  },
};

export default api;
```

### Using Axios

```javascript
// api/config.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
```

---

## 🔐 Authentication

### Login & Get Token

```javascript
import api from './api/config';

export const authService = {
  async login(email, password) {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/jwt`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }
    );

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    const token = data.token; // Adjust based on actual response

    // Store token
    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', email);

    return { token, email };
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};
```

### Protected API Call

```javascript
import api from './api/config';

export async function getUserProfile(email) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/users/${email}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authService.getToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}
```

---

## 🏠 Properties API

### Get All Properties

```javascript
export async function getProperties(filters = {}) {
  const params = new URLSearchParams();

  if (filters.search) params.append('search', filters.search);
  if (filters.minRent) params.append('minRent', filters.minRent);
  if (filters.maxRent) params.append('maxRent', filters.maxRent);
  if (filters.bedrooms) params.append('bedrooms', filters.bedrooms);
  if (filters.propertyType) params.append('propertyType', filters.propertyType);
  if (filters.location) params.append('location', filters.location);
  if (filters.sort) params.append('sort', filters.sort);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/properties?${params}`
  );

  return await response.json();
}
```

### Get Featured Properties

```javascript
export async function getFeaturedProperties() {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/properties/featured`
  );
  return await response.json();
}
```

### Get Single Property

```javascript
export async function getProperty(id) {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/properties/${id}`
  );

  if (!response.ok) {
    throw new Error('Property not found');
  }

  return await response.json();
}
```

### Create Property (Owner Only)

```javascript
export async function createProperty(propertyData) {
  const token = localStorage.getItem('token');

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/properties`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(propertyData),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to create property');
  }

  return await response.json();
}
```

---

## 📅 Bookings API

### Create Booking

```javascript
export async function createBooking(bookingData) {
  const token = localStorage.getItem('token');

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/bookings`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bookingData),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to create booking');
  }

  return await response.json();
}
```

### Get Tenant Bookings

```javascript
export async function getTenantBookings(email) {
  const token = localStorage.getItem('token');

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/bookings/tenant/${email}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return await response.json();
}
```

### Get Owner Bookings

```javascript
export async function getOwnerBookings(email) {
  const token = localStorage.getItem('token');

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/bookings/owner/${email}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return await response.json();
}
```

---

## 💳 Payments API

### Create Payment Intent

```javascript
export async function createPaymentIntent(bookingId, amount) {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/payments/create-payment-intent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, amount }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to create payment intent');
  }

  return await response.json();
}
```

### Stripe Integration

```javascript
// Using Stripe.js in frontend
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('your_stripe_publishable_key');

export async function handlePayment(clientSecret, cardElement) {
  const stripe = await stripePromise;

  const { error, paymentIntent } = await stripe.confirmCardPayment(
    clientSecret,
    {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: 'Customer Name',
        },
      },
    }
  );

  if (error) {
    console.error('Payment error:', error);
    throw error;
  }

  return paymentIntent;
}
```

---

## ⭐ Favorites API

### Add to Favorites

```javascript
export async function addToFavorites(propertyData) {
  const token = localStorage.getItem('token');

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/favorites`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(propertyData),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to add to favorites');
  }

  return await response.json();
}
```

### Get Favorites

```javascript
export async function getFavorites(email) {
  const token = localStorage.getItem('token');

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/favorites/${email}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return await response.json();
}
```

### Remove from Favorites

```javascript
export async function removeFromFavorites(favoriteId) {
  const token = localStorage.getItem('token');

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/favorites/${favoriteId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to remove from favorites');
  }

  return await response.json();
}
```

---

## ⭐ Reviews API

### Add Review

```javascript
export async function addReview(reviewData) {
  const token = localStorage.getItem('token');

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/reviews`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reviewData),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to add review');
  }

  return await response.json();
}
```

### Get Property Reviews

```javascript
export async function getPropertyReviews(propertyId) {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/reviews/property/${propertyId}`
  );

  return await response.json();
}
```

---

## 📊 Analytics API

### Get Owner Analytics

```javascript
export async function getOwnerAnalytics(email) {
  const token = localStorage.getItem('token');

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/analytics/owner/${email}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return await response.json();
}
```

---

## 🔄 React Hooks Example

```javascript
// hooks/useProperties.js
import { useState, useEffect } from 'react';

export function useProperties(filters = {}) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProperties() {
      try {
        setLoading(true);
        const params = new URLSearchParams(filters);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/properties?${params}`
        );

        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();
        setProperties(data.properties || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, [JSON.stringify(filters)]);

  return { properties, loading, error };
}
```

---

## 🧪 Testing API Connection

```javascript
// Test your connection
async function testApiConnection() {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/health`
    );
    const data = await response.json();

    console.log('API Health:', data);
    return data;
  } catch (error) {
    console.error('API Connection failed:', error);
    return null;
  }
}

// Run this on app mount
useEffect(() => {
  testApiConnection();
}, []);
```

---

## 📝 Error Handling Best Practices

```javascript
// utils/apiErrorHandler.js
export function handleApiError(error) {
  if (error.message?.includes('401')) {
    // Unauthorized - redirect to login
    window.location.href = '/login';
  } else if (error.message?.includes('403')) {
    // Forbidden - show permission error
    console.error('Permission denied');
  } else if (error.message?.includes('404')) {
    // Not found
    console.error('Resource not found');
  } else {
    // Generic error
    console.error('An error occurred:', error.message);
  }
}

// Usage
try {
  await createProperty(data);
} catch (error) {
  handleApiError(error);
}
```

---

## 🔗 Quick Reference

| Endpoint | Method | Auth Required |
|----------|--------|---------------|
| `/health` | GET | No |
| `/properties` | GET | No |
| `/properties/featured` | GET | No |
| `/properties/:id` | GET | No |
| `/properties` | POST | Yes (Owner) |
| `/bookings` | POST | Yes (Tenant) |
| `/payments/create-payment-intent` | POST | Yes |
| `/favorites` | POST | Yes (Tenant) |
| `/reviews` | POST | Yes (Tenant) |
| `/analytics/owner/:email` | GET | Yes (Owner) |

---

## 🚀 Next Steps

1. Set up your frontend environment variable with the API URL
2. Implement authentication flow
3. Connect property listing page
4. Implement booking and payment flow
5. Add error handling and loading states

**API URL:** `https://property-rental-server-alpha.vercel.app`
