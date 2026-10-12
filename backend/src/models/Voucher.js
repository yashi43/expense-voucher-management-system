const mongoose = require('mongoose');

const VoucherSchema = new mongoose.Schema(
  {
    // Basic Information
    voucherNumber: {
      type: String,
      required: [true, 'Voucher number is required'],
      unique: true,
      index: true,
    },
    voucherDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    expenseDate: {
      type: Date,
      required: [true, 'Expense date is mandatory'],
    },
    department: {
      type: String,
      required: [true, 'Department is mandatory'],
      trim: true,
    },
    expenseTitle: {
      type: String,
      required: [true, 'Expense title is mandatory'],
      trim: true,
    },
    expenseCategory: {
      type: String,
      required: [true, 'Expense category is mandatory'],
      enum: [
        'Travel',
        'Meals & Entertainment',
        'Office Supplies',
        'Software & Tools',
        'Accommodation',
        'Training & Certification',
        'Client Relations',
        'Communication & Internet',
        'Miscellaneous',
      ],
      default: 'Miscellaneous',
    },
    expenseDescription: {
      type: String,
      trim: true,
      default: '',
    },
    amount: {
      type: Number,
      required: [true, 'Amount is mandatory'],
      min: [0.01, 'Amount must be greater than zero'],
    },

    // Employee Information
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    employeeName: {
      type: String,
      required: [true, 'Employee name is mandatory'],
      trim: true,
    },
    employeeId: {
      type: String,
      trim: true,
      default: '',
    },
    employeeSignature: {
      type: String,
      default: '',
    },

    // Approval Information
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Approved', 'Rejected'],
      default: 'Draft',
      index: true,
    },
    director: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    directorName: {
      type: String,
      default: '',
    },
    directorSignature: {
      type: String,
      default: '',
    },
    approvalDate: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true, // createdDate and lastUpdatedDate
  }
);

// Compound index for efficient searching & filtering
VoucherSchema.index({ status: 1, department: 1, expenseCategory: 1, expenseDate: -1 });

module.exports = mongoose.model('Voucher', VoucherSchema);
