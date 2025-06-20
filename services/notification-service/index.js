const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const notificationRoutes = require('./routes/notifications');
const { connectRabbitMQ } = require('./services/messaging');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'Notification Service',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
async function startServer() {
  try {
    await connectRabbitMQ();
    console.log('✅ RabbitMQ connected and listening for messages');
    
    app.listen(PORT, () => {
      console.log(`🚀 Notification Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
