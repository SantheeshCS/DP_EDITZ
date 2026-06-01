require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const adminRoutes = require('./routes/adminRoutes');
const templateRoutes = require('./routes/templateRoutes');
const orderRoutes = require('./routes/orderRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// CORS Configuration
// ==========================================
const allowedOrigins = [
  process.env.CLIENT_URL, // Public Store Production URL
  process.env.ADMIN_URL,  // Admin Panel Production URL
  'http://localhost:5173', // Vite Dev Localhost (e.g. Public Store)
  'http://localhost:5174', // Vite Dev Localhost (e.g. Admin Panel)
  'http://localhost:3000', // Alternative React Dev Localhost
].map(url => url ? url.replace(/\/$/, '') : null).filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., Postman or Server-to-Server checks)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowed => {
      return allowed === origin || allowed === '*';
    });

    if (isAllowed || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.warn(`Blocked by CORS: Origin ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// ==========================================
// Route registration with special parser ordering
// ==========================================

// CRITICAL: Stripe webhook route must be defined BEFORE express.json()
// to preserve the raw request body buffer needed for signature verification.
app.use('/api/webhook', webhookRoutes);

// Generic body parsers for JSON and URL-encoded requests (applied to other routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets if needed
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Standard API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api', orderRoutes); // Mounts /checkout/:id and /download/:orderId

// ==========================================
// Base Check & Error Handling
// ==========================================
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Template Marketplace API is fully operational.',
    version: '1.0.0',
  });
});

// Fallback Route Not Found (404)
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Global Error:', err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong on the server.' });
});

// ==========================================
// Database Connection & Server Init
// ==========================================
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('CRITICAL ERROR: MONGODB_URI is not defined in environment variables.');
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB Atlas database connection successful.');
    app.listen(PORT, () => {
      console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });
