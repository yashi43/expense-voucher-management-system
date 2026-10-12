const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('../config/db');
const User = require('../models/User');
const Voucher = require('../models/Voucher');
const { Counter } = require('../models/Counter');

// Ensure signature upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/signatures');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Write sample signature PNG / SVG files for demo users
const sampleEmpSigSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100" viewBox="0 0 300 100">
  <path d="M20,60 Q50,20 80,55 T140,45 Q170,80 200,30 T260,65" fill="none" stroke="#1d4ed8" stroke-width="3" stroke-linecap="round"/>
  <text x="50" y="85" font-family="Brush Script MT, cursive, sans-serif" font-size="28" fill="#1e3a8a">Sarah Jenkins</text>
</svg>`;

const sampleDirSigSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100" viewBox="0 0 300 100">
  <path d="M25,50 Q70,10 110,60 T180,30 Q220,70 270,40" fill="none" stroke="#047857" stroke-width="3.5" stroke-linecap="round"/>
  <text x="60" y="85" font-family="Brush Script MT, cursive, sans-serif" font-size="28" fill="#065f46">Marcus Vance</text>
</svg>`;

fs.writeFileSync(path.join(uploadDir, 'employee-sample.svg'), sampleEmpSigSvg);
fs.writeFileSync(path.join(uploadDir, 'director-sample.svg'), sampleDirSigSvg);

const empSigUrl = '/uploads/signatures/employee-sample.svg';
const dirSigUrl = '/uploads/signatures/director-sample.svg';

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Voucher.deleteMany({});
    await Counter.deleteMany({});

    console.log('[Seed] Creating demo users...');
    const employee = await User.create({
      name: 'Sarah Jenkins',
      email: 'employee@abc.com',
      password: 'Password123!',
      role: 'employee',
      employeeId: 'EMP-2041',
      department: 'Engineering',
      signatureUrl: empSigUrl,
    });

    const director = await User.create({
      name: 'Marcus Vance',
      email: 'director@abc.com',
      password: 'Password123!',
      role: 'director',
      employeeId: 'DIR-1002',
      department: 'Executive Board',
      signatureUrl: dirSigUrl,
    });

    const accounts = await User.create({
      name: 'Elena Rostova',
      email: 'accounts@abc.com',
      password: 'Password123!',
      role: 'accounts',
      employeeId: 'ACC-3015',
      department: 'Accounts & Finance',
      signatureUrl: '',
    });

    console.log('[Seed] Created users:');
    console.log(' - Employee: employee@abc.com / Password123!');
    console.log(' - Director: director@abc.com / Password123!');
    console.log(' - Accounts: accounts@abc.com / Password123!');

    const year = new Date().getFullYear();
    await Counter.create({ _id: `voucher_${year}`, seq: 4 });

    console.log('[Seed] Seeding realistic sample expense vouchers...');

    // 1. Draft Voucher
    await Voucher.create({
      voucherNumber: `EV-${year}-0001`,
      voucherDate: new Date(Date.now() - 4 * 86400000),
      expenseDate: new Date(Date.now() - 5 * 86400000),
      department: 'Engineering',
      expenseTitle: 'Ergonomic Keyboards & Monitor Arms',
      expenseCategory: 'Office Supplies',
      expenseDescription: 'Purchased 2 ergonomic split keyboards and dual-monitor desk mounts for backend dev stations.',
      amount: 284.50,
      employee: employee._id,
      employeeName: employee.name,
      employeeId: employee.employeeId,
      employeeSignature: empSigUrl,
      status: 'Draft',
    });

    // 2. Submitted (Pending Approval) Voucher
    await Voucher.create({
      voucherNumber: `EV-${year}-0002`,
      voucherDate: new Date(Date.now() - 2 * 86400000),
      expenseDate: new Date(Date.now() - 3 * 86400000),
      department: 'Engineering',
      expenseTitle: 'Flight & Hotel for Tech Conference 2026',
      expenseCategory: 'Travel',
      expenseDescription: 'Round-trip flight tickets and 2 nights hotel accommodation to attend AWS Cloud Architecture Summit.',
      amount: 1450.00,
      employee: employee._id,
      employeeName: employee.name,
      employeeId: employee.employeeId,
      employeeSignature: empSigUrl,
      status: 'Submitted',
    });

    // 3. Approved Voucher
    await Voucher.create({
      voucherNumber: `EV-${year}-0003`,
      voucherDate: new Date(Date.now() - 10 * 86400000),
      expenseDate: new Date(Date.now() - 12 * 86400000),
      department: 'Engineering',
      expenseTitle: 'Annual Production Cloud Server Subscription',
      expenseCategory: 'Software & Tools',
      expenseDescription: 'Production API hosting renewal and MongoDB Atlas dedicated cluster tier.',
      amount: 3200.00,
      employee: employee._id,
      employeeName: employee.name,
      employeeId: employee.employeeId,
      employeeSignature: empSigUrl,
      status: 'Approved',
      director: director._id,
      directorName: director.name,
      directorSignature: dirSigUrl,
      approvalDate: new Date(Date.now() - 8 * 86400000),
    });

    // 4. Rejected Voucher
    await Voucher.create({
      voucherNumber: `EV-${year}-0004`,
      voucherDate: new Date(Date.now() - 15 * 86400000),
      expenseDate: new Date(Date.now() - 18 * 86400000),
      department: 'Engineering',
      expenseTitle: 'Weekend Luxury Resort Relaxation Spa',
      expenseCategory: 'Meals & Entertainment',
      expenseDescription: 'Personal team weekend wellness package.',
      amount: 890.00,
      employee: employee._id,
      employeeName: employee.name,
      employeeId: employee.employeeId,
      employeeSignature: empSigUrl,
      status: 'Rejected',
      director: director._id,
      directorName: director.name,
      approvalDate: new Date(Date.now() - 14 * 86400000),
      rejectionReason: 'Non-reimbursable personal expense: ABC Company travel policy strictly excludes spa and personal recreational services.',
    });

    console.log('[Seed] Database successfully seeded with demo vouchers and users!');
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
