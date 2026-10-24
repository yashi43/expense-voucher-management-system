const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const voucherRoutes = require('./routes/voucherRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const errorHandler = require('./middleware/error');
const Voucher = require('./models/Voucher');
const seedData = require('./utils/seed');

const app = express();

// Connect to MongoDB and seed if database is empty
connectDB().then(async () => {
  try {
    const voucherCount = await Voucher.countDocuments();
    if (voucherCount === 0) {
      console.log('[Server] Database is empty. Seeding initial employee vouchers and demo accounts...');
      await seedData();
    }
  } catch (err) {
    console.error('[Server] Auto-seed check error:', err.message);
  }
});

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'Bharat Tech Solutions - Employee Expense Voucher Management System API',
    currency: 'INR (₹)',
    timestamp: new Date(),
  });
});

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Server] Bharat Tech Solutions Voucher API running on port ${PORT}`);
});

module.exports = app;
