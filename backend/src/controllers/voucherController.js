const Voucher = require('../models/Voucher');
const { getNextVoucherNumber } = require('../models/Counter');

// @desc    Get all vouchers (with optional search filter)
// @route   GET /api/vouchers
exports.getVouchers = async (req, res, next) => {
  try {
    const { search, status, department } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { voucherNumber: searchRegex },
        { employeeName: searchRegex },
        { expenseTitle: searchRegex },
        { department: searchRegex },
      ];
    }

    const vouchers = await Voucher.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: vouchers.length,
      data: vouchers,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single voucher by ID
// @route   GET /api/vouchers/:id
exports.getVoucherById = async (req, res, next) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }

    res.status(200).json({
      success: true,
      data: voucher,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new voucher
// @route   POST /api/vouchers
exports.createVoucher = async (req, res, next) => {
  try {
    const {
      employeeName,
      employeeId,
      department,
      expenseTitle,
      expenseCategory,
      expenseDate,
      amount,
      description,
      expenseDescription,
      status,
    } = req.body;

    const finalEmployeeName = (employeeName && employeeName.trim()) || req.user?.name || 'Yashi Mehta';
    const finalDepartment = (department && department.trim()) || req.user?.department || 'Software Engineering';
    const finalEmployeeId = employeeId !== undefined ? employeeId : (req.user?.employeeId || 'EMP-101');
    const finalDescription = (description || expenseDescription || '').trim();

    if (!finalEmployeeName) {
      return res.status(400).json({ success: false, message: 'Employee name is required' });
    }
    if (!finalDepartment) {
      return res.status(400).json({ success: false, message: 'Department is required' });
    }
    if (!expenseTitle || !expenseTitle.trim()) {
      return res.status(400).json({ success: false, message: 'Expense title is required' });
    }
    if (!expenseDate) {
      return res.status(400).json({ success: false, message: 'Expense date is required' });
    }
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Amount in INR (₹) must be greater than zero' });
    }

    // Auto-generate sequential unique Voucher Number
    const voucherNumber = await getNextVoucherNumber();

    const voucher = await Voucher.create({
      voucherNumber,
      employeeName: finalEmployeeName,
      employeeId: finalEmployeeId,
      department: finalDepartment,
      expenseTitle: expenseTitle.trim(),
      expenseCategory: expenseCategory || 'Miscellaneous',
      expenseDate: new Date(expenseDate),
      amount: Number(amount),
      description: finalDescription,
      expenseDescription: finalDescription,
      status: status || 'Pending',
      user: req.user?._id || undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Voucher created successfully in MongoDB',
      data: voucher,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update an existing voucher
// @route   PUT /api/vouchers/:id
exports.updateVoucher = async (req, res, next) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }

    const {
      employeeName,
      employeeId,
      department,
      expenseTitle,
      expenseCategory,
      expenseDate,
      amount,
      description,
      expenseDescription,
      status,
      rejectionReason,
    } = req.body;

    if (employeeName) voucher.employeeName = employeeName.trim();
    if (employeeId !== undefined) voucher.employeeId = employeeId.trim();
    if (department) voucher.department = department.trim();
    if (expenseTitle) voucher.expenseTitle = expenseTitle.trim();
    if (expenseCategory) voucher.expenseCategory = expenseCategory;
    if (expenseDate) voucher.expenseDate = new Date(expenseDate);
    if (status) voucher.status = status;
    if (rejectionReason !== undefined) voucher.rejectionReason = rejectionReason;

    const descToUpdate = description !== undefined ? description : expenseDescription;
    if (descToUpdate !== undefined) {
      voucher.description = descToUpdate.trim();
      voucher.expenseDescription = descToUpdate.trim();
    }

    if (amount !== undefined) {
      if (Number(amount) <= 0) {
        return res.status(400).json({ success: false, message: 'Amount must be greater than zero' });
      }
      voucher.amount = Number(amount);
    }

    await voucher.save();

    res.status(200).json({
      success: true,
      message: 'Voucher updated successfully in MongoDB',
      data: voucher,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a voucher
// @route   DELETE /api/vouchers/:id
exports.deleteVoucher = async (req, res, next) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }

    await voucher.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Voucher permanently deleted from MongoDB',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit voucher for review
// @route   POST /api/vouchers/:id/submit
exports.submitVoucher = async (req, res, next) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }
    voucher.status = 'Pending';
    await voucher.save();
    res.status(200).json({ success: true, message: 'Voucher submitted', data: voucher });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve voucher
// @route   POST /api/vouchers/:id/approve
exports.approveVoucher = async (req, res, next) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }
    voucher.status = 'Approved';
    voucher.approvalDate = new Date();
    voucher.directorName = req.user?.name || 'Director of Operations';
    await voucher.save();
    res.status(200).json({ success: true, message: 'Voucher approved', data: voucher });
  } catch (err) {
    next(err);
  }
};

// @desc    Reject voucher
// @route   POST /api/vouchers/:id/reject
exports.rejectVoucher = async (req, res, next) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }
    voucher.status = 'Rejected';
    voucher.approvalDate = new Date();
    voucher.rejectionReason = req.body.rejectionReason || 'Voucher claim does not comply with company policy.';
    await voucher.save();
    res.status(200).json({ success: true, message: 'Voucher rejected', data: voucher });
  } catch (err) {
    next(err);
  }
};
