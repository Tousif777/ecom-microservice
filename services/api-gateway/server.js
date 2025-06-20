const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Service URLs
const services = {
  user: process.env.USER_SERVICE_URL || 'http://user-service:3001',
  product: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002',
  order: process.env.ORDER_SERVICE_URL || 'http://order-service:3003',
  payment: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3004',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005'
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: services
  });
});

// Generic proxy handler
const proxyHandler = (serviceUrl) => {
  return async (req, res) => {
    try {
      const targetUrl = `${serviceUrl}${req.originalUrl}`;
      console.log(`Proxying ${req.method} request to: ${targetUrl}`);

      const config = {
        method: req.method,
        url: targetUrl,
        headers: {
          'Content-Type': req.headers['content-type'] || 'application/json',
          'Authorization': req.headers.authorization || ''
        },
        timeout: 30000
      };

      if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
        config.data = req.body;
      }

      const response = await axios(config);
      res.status(response.status).json(response.data);
    } catch (error) {
      console.error(`Proxy error for ${serviceUrl}:`, error.message);
      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(500).json({ error: 'Service temporarily unavailable' });
      }
    }
  };
};

// Route to User Service
app.use('/api/users', proxyHandler(services.user));

// Route to Product Service
app.use('/api/products', proxyHandler(services.product));

// Route to Order Service
app.use('/api/orders', proxyHandler(services.order));

// Route to Payment Service
app.use('/api/payments', proxyHandler(services.payment));

// Route to Notification Service
app.use('/api/notifications', proxyHandler(services.notification));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Gateway error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📡 Proxying to services:`, services);
});
