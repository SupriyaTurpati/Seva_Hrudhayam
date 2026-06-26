require('dotenv').config();
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const { connectDB } = require('./config/db');
const socketUtil = require('./utils/socket');
const Admin = require('./models/Admin');

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = socketio(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});
socketUtil.init(io);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Seed Default Admin User
const seedDefaultAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ email: 'admin@sevahrudhayam.org' });
    if (!adminExists) {
      await Admin.create({
        email: 'admin@sevahrudhayam.org',
        password: 'admin123' // Hashed automatically by Admin model pre-save hook
      });
      console.log('----------------------------------------------------');
      console.log('Seeded default admin user:');
      console.log('Email: admin@sevahrudhayam.org');
      console.log('Password: admin123');
      console.log('----------------------------------------------------');
    }
  } catch (error) {
    console.error('Error seeding default admin:', error.message);
  }
};
seedDefaultAdmin();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/donations', require('./routes/donationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Root Endpoint
app.get('/', (req, res) => {
  res.send('Seva Hrudhayam Backend API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
