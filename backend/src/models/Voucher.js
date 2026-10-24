const mongoose = require('mongoose');

const VoucherSchema = new mongoose.Schema(
  {
    voucherNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    employeeName: {
      type: String,
      required: [true, 'Employee name is required'],
      trim: true,
    },
    employeeId: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    expenseTitle: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
    },
    expenseCategory: {
      type: String,
      required: [true, 'Expense category is required'],
      default: 'Miscellaneous',
    },
    expenseDate: {
      type: Date,
      required: [true, 'Expense date is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount in INR (₹) is required'],
      min: [1, 'Amount must be at least ₹1'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    expenseDescription: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Paid', 'Rejected', 'Draft', 'Submitted'],
      default: 'Pending',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    employeeSignature: {
      type: String,
      default: '',
    },
    directorSignature: {
      type: String,
      default: '',
    },
    directorName: {
      type: String,
      default: '',
    },
    approvalDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Voucher', VoucherSchema);
