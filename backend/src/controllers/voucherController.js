const Voucher = require('../models/Voucher');
const { getNextVoucherNumber } = require('../models/Counter');

// @desc    Create a new voucher (Always starts as Draft)
// @route   POST /api/vouchers
// @access  Private (Employee only)
exports.createVoucher = async (req, res, next) => {
  try {
    const {
      expenseDate,
      department,
      expenseTitle,
      expenseCategory,
      expenseDescription,
      amount,
      employeeSignature,
    } = req.body;

    // Validate required fields
    if (!department || !department.trim()) {
      return res.status(400).json({ success: false, message: 'Department is mandatory' });
    }
    if (!expenseTitle || !expenseTitle.trim()) {
      return res.status(400).json({ success: false, message: 'Expense Title is mandatory' });
    }
    if (!expenseDate) {
      return res.status(400).json({ success: false, message: 'Expense Date is mandatory' });
    }
    if (amount === undefined || amount === null || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Amount is mandatory and must be greater than zero' });
    }

    // Auto-generate sequential unique Voucher Number
    const voucherNumber = await getNextVoucherNumber();

    // Create voucher in Draft status
    const voucher = await Voucher.create({
      voucherNumber,
      voucherDate: new Date(),
      expenseDate: new Date(expenseDate),
      department: department.trim(),
      expenseTitle: expenseTitle.trim(),
      expenseCategory: expenseCategory || 'Miscellaneous',
      expenseDescription: expenseDescription ? expenseDescription.trim() : '',
      amount: Number(amount),
      employee: req.user._id,
      employeeName: req.user.name,
      employeeId: req.user.employeeId || '',
      employeeSignature: employeeSignature || req.user.signatureUrl || '',
      status: 'Draft', // Rule 3: Every new voucher should initially be saved as Draft
    });

    res.status(201).json({
      success: true,
      message: 'Voucher created and saved as Draft',
      data: voucher,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a Draft voucher
// @route   PUT /api/vouchers/:id
// @access  Private (Employee only, owner only, Draft status only)
exports.updateVoucher = async (req, res, next) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }

    // Check ownership
    if (voucher.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only edit vouchers created by yourself',
      });
    }

    // Business Rule 4: Employees may edit or delete vouchers only while they are in Draft status.
    if (voucher.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Cannot edit voucher with status '${voucher.status}'. Only Draft vouchers can be edited.`,
      });
    }

    const {
      expenseDate,
      department,
      expenseTitle,
      expenseCategory,
      expenseDescription,
      amount,
      employeeSignature,
    } = req.body;

    if (department) voucher.department = department.trim();
    if (expenseTitle) voucher.expenseTitle = expenseTitle.trim();
    if (expenseDate) voucher.expenseDate = new Date(expenseDate);
    if (expenseCategory) voucher.expenseCategory = expenseCategory;
    if (expenseDescription !== undefined) voucher.expenseDescription = expenseDescription.trim();
    if (amount !== undefined) {
      if (Number(amount) <= 0) {
        return res.status(400).json({ success: false, message: 'Amount must be greater than zero' });
      }
      voucher.amount = Number(amount);
    }
    if (employeeSignature !== undefined) voucher.employeeSignature = employeeSignature;

    await voucher.save();

    res.status(200).json({
      success: true,
      message: 'Draft voucher updated successfully',
      data: voucher,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a Draft voucher
// @route   DELETE /api/vouchers/:id
// @access  Private (Employee only, owner only, Draft status only)
exports.deleteVoucher = async (req, res, next) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }

    // Check ownership
    if (voucher.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete vouchers created by yourself',
      });
    }

    // Business Rule 4: Employees may edit or delete vouchers only while they are in Draft status.
    if (voucher.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete voucher with status '${voucher.status}'. Only Draft vouchers can be deleted.`,
      });
    }

    await voucher.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Voucher deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit a Draft voucher for approval
// @route   POST /api/vouchers/:id/submit
// @access  Private (Employee only, owner only)
exports.submitVoucher = async (req, res, next) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }

    // Check ownership
    if (voucher.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only submit vouchers created by yourself',
      });
    }

    if (voucher.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Only Draft vouchers can be submitted. Current status is '${voucher.status}'.`,
      });
    }

    // Signature check: rule 9 & 12: Employee Signature is mandatory before submission
    const signatureToUse = req.body.employeeSignature || voucher.employeeSignature || req.user.signatureUrl;
    if (!signatureToUse) {
      return res.status(400).json({
        success: false,
        message: 'Employee signature is mandatory before submitting a voucher for approval.',
      });
    }

    // Verify all mandatory fields are present
    if (!voucher.department || !voucher.expenseTitle || !voucher.expenseDate || !voucher.amount || voucher.amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all required voucher fields (Department, Title, Date, Amount > 0) before submitting.',
      });
    }

    voucher.employeeSignature = signatureToUse;
    voucher.status = 'Submitted';
    await voucher.save();

    res.status(200).json({
      success: true,
      message: 'Voucher submitted successfully for Director approval',
      data: voucher,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get vouchers with search, filter, pagination, and sorting
// @route   GET /api/vouchers
// @access  Private (Employee: own only; Director & Accounts: all)
exports.getVouchers = async (req, res, next) => {
  try {
    const queryObj = {};

    // Role-based scoping (Rule 9, 10, 11)
    if (req.user.role === 'employee') {
      // Employees can only view vouchers created by themselves
      queryObj.employee = req.user._id;
    }

    // Filter by Status
    if (req.query.status && req.query.status !== 'All') {
      queryObj.status = req.query.status;
    }

    // Filter by Department
    if (req.query.department && req.query.department !== 'All') {
      queryObj.department = req.query.department;
    }

    // Filter by Category
    if (req.query.category && req.query.category !== 'All') {
      queryObj.expenseCategory = req.query.category;
    }

    // Search by Voucher Number or Expense Title or Employee Name
    if (req.query.search && req.query.search.trim()) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      queryObj.$or = [
        { voucherNumber: searchRegex },
        { expenseTitle: searchRegex },
        { employeeName: searchRegex },
        { department: searchRegex },
      ];
    }

    // Date Range (Expense Date)
    if (req.query.startDate || req.query.endDate) {
      queryObj.expenseDate = {};
      if (req.query.startDate) {
        queryObj.expenseDate.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        const endOfDay = new Date(req.query.endDate);
        endOfDay.setHours(23, 59, 59, 999);
        queryObj.expenseDate.$lte = endOfDay;
      }
    }

    // Amount Range
    if (req.query.minAmount !== undefined && req.query.minAmount !== '') {
      queryObj.amount = queryObj.amount || {};
      queryObj.amount.$gte = Number(req.query.minAmount);
    }
    if (req.query.maxAmount !== undefined && req.query.maxAmount !== '') {
      queryObj.amount = queryObj.amount || {};
      queryObj.amount.$lte = Number(req.query.maxAmount);
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (req.query.sortBy) {
      const sortField = req.query.sortBy;
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      sortOption = { [sortField]: sortOrder };
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await Voucher.countDocuments(queryObj);
    const vouchers = await Voucher.find(queryObj)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('employee', 'name email employeeId department');

    res.status(200).json({
      success: true,
      count: vouchers.length,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      data: vouchers,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single voucher by ID
// @route   GET /api/vouchers/:id
// @access  Private (Employee: own only; Director & Accounts: all)
exports.getVoucherById = async (req, res, next) => {
  try {
    const voucher = await Voucher.findById(req.params.id)
      .populate('employee', 'name email employeeId department')
      .populate('director', 'name email department');

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }

    // Role verification: employees can ONLY view vouchers created by themselves
    if (
      req.user.role === 'employee' &&
      voucher.employee._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view other employees’ vouchers.',
      });
    }

    res.status(200).json({
      success: true,
      data: voucher,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve voucher
// @route   POST /api/vouchers/:id/approve
// @access  Private (Director only)
exports.approveVoucher = async (req, res, next) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }

    // Check status
    if (voucher.status !== 'Submitted') {
      return res.status(400).json({
        success: false,
        message: `Only vouchers in 'Submitted' (Pending Approval) status can be approved. Current status: '${voucher.status}'`,
      });
    }

    // Validation: Director signature is mandatory before approval (Rule 9 & 13)
    const directorSignature = req.body.directorSignature || req.user.signatureUrl;
    if (!directorSignature) {
      return res.status(400).json({
        success: false,
        message: 'Director signature is mandatory to approve this voucher.',
      });
    }

    // Update approval details
    voucher.status = 'Approved';
    voucher.director = req.user._id;
    voucher.directorName = req.user.name;
    voucher.directorSignature = directorSignature;
    voucher.approvalDate = new Date();
    voucher.rejectionReason = ''; // Clear rejection reason if any

    await voucher.save();

    res.status(200).json({
      success: true,
      message: 'Voucher approved successfully',
      data: voucher,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reject voucher
// @route   POST /api/vouchers/:id/reject
// @access  Private (Director only)
exports.rejectVoucher = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;

    // Validation: Rejection reason is mandatory if a voucher is rejected (Rule 9 & 8)
    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is mandatory when rejecting a voucher.',
      });
    }

    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }

    // Check status
    if (voucher.status !== 'Submitted') {
      return res.status(400).json({
        success: false,
        message: `Only vouchers in 'Submitted' (Pending Approval) status can be rejected. Current status: '${voucher.status}'`,
      });
    }

    voucher.status = 'Rejected';
    voucher.director = req.user._id;
    voucher.directorName = req.user.name;
    voucher.approvalDate = new Date();
    voucher.rejectionReason = rejectionReason.trim();

    await voucher.save();

    res.status(200).json({
      success: true,
      message: 'Voucher rejected with reason provided',
      data: voucher,
    });
  } catch (err) {
    next(err);
  }
};
