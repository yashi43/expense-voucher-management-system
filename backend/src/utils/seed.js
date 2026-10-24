const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('../config/db');
const Voucher = require('../models/Voucher');
const User = require('../models/User');
const { Counter } = require('../models/Counter');

const seedData = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    console.log('[Seed] Clearing existing collections...');
    await Voucher.deleteMany({});
    await Counter.deleteMany({});
    await User.deleteMany({});

    console.log('[Seed] Seeding Indian demo user accounts...');
    const users = await User.create([
      {
        name: 'Yashi Mehta',
        email: 'yashi@bharattech.com',
        password: 'Password123!',
        role: 'employee',
        employeeId: 'EMP-101',
        department: 'Software Engineering',
      },
      {
        name: 'Sakshi Phadtare',
        email: 'sakshi@bharattech.com',
        password: 'Password123!',
        role: 'director',
        employeeId: 'DIR-201',
        department: 'Executive Board',
      },
      {
        name: 'Varad Jadhav',
        email: 'varad@bharattech.com',
        password: 'Password123!',
        role: 'accounts',
        employeeId: 'ACC-301',
        department: 'Finance & Accounts',
      },
      // Backward-compatible alias accounts
      {
        name: 'Demo Employee (Sarah)',
        email: 'employee@abc.com',
        password: 'Password123!',
        role: 'employee',
        employeeId: 'EMP-100',
        department: 'Engineering',
      },
      {
        name: 'Demo Director (Marcus)',
        email: 'director@abc.com',
        password: 'Password123!',
        role: 'director',
        employeeId: 'DIR-200',
        department: 'Executive Board',
      },
      {
        name: 'Demo Accounts (Elena)',
        email: 'accounts@abc.com',
        password: 'Password123!',
        role: 'accounts',
        employeeId: 'ACC-300',
        department: 'Finance & Accounts',
      },
    ]);

    const year = new Date().getFullYear();
    await Counter.create({ _id: `voucher_${year}`, seq: 5 });

    console.log('[Seed] Seeding Indian employee expense vouchers...');

    await Voucher.create([
      {
        voucherNumber: `EV-${year}-0001`,
        employeeName: 'Yashi Mehta',
        employeeId: 'EMP-101',
        department: 'Software Engineering',
        expenseTitle: 'Full Stack Web Development & AWS Cloud Certification',
        expenseCategory: 'Training & Certification',
        expenseDate: new Date(Date.now() - 3 * 86400000),
        amount: 4999.00,
        description: 'Enrolled in Full Stack MERN advanced developer certification course.',
        expenseDescription: 'Enrolled in Full Stack MERN advanced developer certification course.',
        status: 'Approved',
        user: users[0]._id,
      },
      {
        voucherNumber: `EV-${year}-0002`,
        employeeName: 'Sakshi Phadtare',
        employeeId: 'EMP-102',
        department: 'Marketing & Sales',
        expenseTitle: 'Client Presentation & Cab Conveyance (Mumbai to Pune)',
        expenseCategory: 'Travel & Conveyance',
        expenseDate: new Date(Date.now() - 5 * 86400000),
        amount: 2450.00,
        description: 'Cab travel fare and toll expenses for on-site client software demonstration.',
        expenseDescription: 'Cab travel fare and toll expenses for on-site client software demonstration.',
        status: 'Pending',
        user: users[1]._id,
      },
      {
        voucherNumber: `EV-${year}-0003`,
        employeeName: 'Varad Jadhav',
        employeeId: 'EMP-103',
        department: 'Operations & Logistics',
        expenseTitle: 'Office Stationery, Whiteboards & Lab Equipment',
        expenseCategory: 'Office Supplies & Stationery',
        expenseDate: new Date(Date.now() - 8 * 86400000),
        amount: 1280.00,
        description: 'Purchased dry-erase whiteboard markers, printer paper reams and cables.',
        expenseDescription: 'Purchased dry-erase whiteboard markers, printer paper reams and cables.',
        status: 'Paid',
        user: users[2]._id,
      },
      {
        voucherNumber: `EV-${year}-0004`,
        employeeName: 'Aarav Sharma',
        employeeId: 'EMP-104',
        department: 'Human Resources',
        expenseTitle: 'Project Milestone Completion Team Lunch & Refreshments',
        expenseCategory: 'Meals & Refreshments',
        expenseDate: new Date(Date.now() - 10 * 86400000),
        amount: 3200.00,
        description: 'Team lunch to celebrate the successful deployment of Phase 1.',
        expenseDescription: 'Team lunch to celebrate the successful deployment of Phase 1.',
        status: 'Approved',
      },
      {
        voucherNumber: `EV-${year}-0005`,
        employeeName: 'Pooja Patel',
        employeeId: 'EMP-105',
        department: 'IT Infrastructure',
        expenseTitle: 'Annual Production Cloud Server & Database Renewal',
        expenseCategory: 'Software & Cloud Tools',
        expenseDate: new Date(Date.now() - 12 * 86400000),
        amount: 14500.00,
        description: 'Renewed dedicated MongoDB cluster tier and hosting services.',
        expenseDescription: 'Renewed dedicated MongoDB cluster tier and hosting services.',
        status: 'Pending',
      },
    ]);

    console.log('[Seed] Database successfully seeded with 5 realistic Indian vouchers!');
    return true;
  } catch (error) {
    console.error('[Seed Error]:', error);
    throw error;
  }
};

if (require.main === module) {
  seedData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedData;
