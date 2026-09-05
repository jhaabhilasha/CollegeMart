const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');

// Ensure JWT_SECRET has a safe fallback if not set yet
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET environment variable not set. Using default secret key.');
  process.env.JWT_SECRET = 'collegeconnect-default-secret-key-2026';
}

if (!process.env.MONGO_URI) {
  console.warn('⚠️ MONGO_URI environment variable not set. Please add MONGO_URI in your Render Environment settings.');
}

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CORS configuration - allow localhost in dev, onrender/configured origins in production
const defaultOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];
const configuredOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) 
  : [];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (
      configuredOrigins.includes(origin) ||
      defaultOrigins.includes(origin) ||
      origin.includes('onrender.com') ||
      origin.includes('vercel.app') ||
      !process.env.ALLOWED_ORIGINS
    ) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true
}));

const fs = require('fs');

app.use(helmet({ contentSecurityPolicy: false }));

// Serve frontend static files if dist folder exists
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const mongoState = mongoose.connection.readyState;
  const mongoStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  
  res.json({
    status: mongoState === 1 ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: mongoStates[mongoState] || 'unknown',
      name: mongoose.connection.name || 'N/A',
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
    },
  });
});

// Import routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/users', require('./routes/users'));
app.use('/api/messages', require('./routes/messages'));

// Non-API routes: serve frontend SPA or friendly status page instead of "Cannot GET /"
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.send(`
    <div style="font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 60px 20px; color: #333;">
      <h1 style="color: #ef6c13;">CollegeConnect Backend Server</h1>
      <p style="font-size: 18px;">The backend API is running successfully on port 5000.</p>
      <p>Looking for the frontend web application?</p>
      <a href="http://localhost:5173" style="display: inline-block; background: #ef6c13; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: bold; margin-top: 10px;">
        Open Frontend App (localhost:5173) &rarr;
      </a>
      <div style="margin-top: 30px;">
        <a href="/api/health" style="color: #666; text-decoration: underline;">Check API Health Status</a>
      </div>
    </div>
  `);
});

// Error handler middleware
app.use(require('./middleware/errorHandler'));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: function(origin, callback) {
      if (!origin) return callback(null, true);
      if (
        configuredOrigins.includes(origin) ||
        defaultOrigins.includes(origin) ||
        origin.includes('onrender.com') ||
        origin.includes('vercel.app') ||
        !process.env.ALLOWED_ORIGINS
      ) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'), false);
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});


// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join user room
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    }
  });

  socket.on('sendMessage', (message) => {
    // Emit to both the receiver's and sender's room for real-time sync
    if (message && message.receiverId && message.senderId) {
      io.to(message.receiverId).to(message.senderId).emit('receiveMessage', message);
    } else if (message && message.receiverId) {
      io.to(message.receiverId).emit('receiveMessage', message);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

// Start server immediately so Render detects port binding without timing out
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// MongoDB connection options
const mongoOptions = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000
};

// Use MONGO_URI from .env file or environment variable
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/collegeconnect';

mongoose.connect(MONGO_URI, mongoOptions)
  .then(() => {
    const isLocal = MONGO_URI.includes('localhost') || MONGO_URI.includes('127.0.0.1');
    console.log('Connected to MongoDB:', isLocal ? 'localhost' : 'Atlas');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
  });