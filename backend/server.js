require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const adminRoutes = require('./routes/adminRoutes');
const templateRoutes = require('./routes/templateRoutes');
const downloadRoutes = require('./routes/downloadRoutes');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// ==========================================
// CORS Configuration
// ==========================================
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
]
  .map((url) => (url ? url.replace(/\/$/, '') : null))
  .filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some(
      (allowed) => allowed === origin || allowed === '*'
    );

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
// Socket.IO
// ==========================================
const io = new Server(server, {
  cors: corsOptions,
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// ==========================================
// Middleware
// ==========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================
// API Routes
// ==========================================
app.use('/api/admin', adminRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/download', downloadRoutes);

// ==========================================
// Health Check Route
// ==========================================
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Template Marketplace API is fully operational.',
    version: '1.0.0',
  });
});

// ==========================================
// 404 Handler
// ==========================================
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found.',
  });
});

// ==========================================
// Global Error Handler
// ==========================================
app.use((err, req, res, next) => {
  console.error('Unhandled Global Error:', err.stack);

  res.status(500).json({
    error: err.message || 'Something went wrong on the server.',
  });
});

// ==========================================
// Database Connection & Server Start
// ==========================================
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error(
    'CRITICAL ERROR: MONGODB_URI is not defined in environment variables.'
  );
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB Atlas database connection successful.');

    server.listen(PORT, () => {
      console.log(
        `Server is running in ${
          process.env.NODE_ENV || 'development'
        } mode on port ${PORT}`
      );
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });