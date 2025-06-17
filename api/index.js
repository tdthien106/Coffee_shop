const express = require('express');
const app = express();

// Import routes
const productsRouter = require('./products');

// Middleware
app.use(express.json());

// Routes
app.use('/api/products', productsRouter);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'API Đồ uống đang hoạt động!' });
});

// Export the app for Vercel
module.exports = app;