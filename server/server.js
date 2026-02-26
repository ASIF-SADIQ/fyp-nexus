const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first'); // Forces Node to use stable IPv4
require('dotenv').config(); // ✅ CRITICAL: This MUST be Line 1

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet'); 
const notificationRoutes = require('./routes/notificationRoutes');
const deadlineRoutes = require('./routes/deadlineRoutes'); 
const { errorHandler } = require('./middleware/errorMiddleware');
const userRoutes = require('./routes/userRoutes'); 
const projectRoutes = require('./routes/projectRoutes'); 
const aiRoutes = require('./routes/aiRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// --- 1. SECURITY & MIDDLEWARE ---
app.use(helmet()); 

// ✅ FINAL FIX: This allows your Vercel site to talk to your Render server without being blocked
app.use(cors({
  origin: true, 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- 2. DATABASE CONNECTION ---
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ DB Connection Error: ${err.message}`);
    process.exit(1);
  }
};

connectDB();

// --- 3. ROUTES ---
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/deadlines', deadlineRoutes); 

app.get('/', (req, res) => {
  res.json({ 
    message: 'FYP Nexus API is Running 🚀', 
    status: 'Stable',
    environment: process.env.NODE_ENV || 'production'
  });
});

// --- 4. GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// --- 5. SERVER START ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server active on port ${PORT}`);
  if (!process.env.CLOUDINARY_NAME) {
    console.error("⚠️ WARNING: Cloudinary variables are NOT loaded.");
  }
});

module.exports = app;