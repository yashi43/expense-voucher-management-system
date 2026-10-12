const Voucher = require('../models/Voucher');

// @desc    Get metrics for current user based on their role
// @route   GET /api/dashboard/stats
// @access  Private (Employee, Director, Accounts)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const role = req.user.role;
    const userId = req.user._id;

    if (role === 'employee') {
      // 8.1 Employee Dashboard
      // - Total Vouchers
      // - Draft Vouchers
      // - Pending Approval
      // - Approved Vouchers
      // - Rejected Vouchers
      // - Total Amount Claimed
      const [total, draft, pending, approved, rejected, amountAgg, recent] = await Promise.all([
        Voucher.countDocuments({ employee: userId }),
        Voucher.countDocuments({ employee: userId, status: 'Draft' }),
        Voucher.countDocuments({ employee: userId, status: 'Submitted' }),
        Voucher.countDocuments({ employee: userId, status: 'Approved' }),
        Voucher.countDocuments({ employee: userId, status: 'Rejected' }),
        Voucher.aggregate([
          { $match: { employee: userId } },
          { $group: { _id: null, totalClaimed: { $sum: '$amount' } } },
        ]),
        Voucher.find({ employee: userId }).sort({ createdAt: -1 }).limit(5),
      ]);

      return res.status(200).json({
        success: true,
        role: 'employee',
        stats: {
          totalVouchers: total,
          draftVouchers: draft,
          pendingApproval: pending,
          approvedVouchers: approved,
          rejectedVouchers: rejected,
          totalAmountClaimed: amountAgg.length > 0 ? amountAgg[0].totalClaimed : 0,
        },
        recentVouchers: recent,
      });
    }

    if (role === 'director') {
      // 8.2 Director Dashboard
      // - Pending Approval Count
      // - Approved Today
      // - Rejected Today
      // - Total Pending Amount
      // - Recent Voucher Activity
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const [pendingCount, pendingAmountAgg, approvedToday, rejectedToday, recentActivity] =
        await Promise.all([
          Voucher.countDocuments({ status: 'Submitted' }),
          Voucher.aggregate([
            { $match: { status: 'Submitted' } },
            { $group: { _id: null, totalPending: { $sum: '$amount' } } },
          ]),
          Voucher.countDocuments({
            status: 'Approved',
            approvalDate: { $gte: startOfToday },
          }),
          Voucher.countDocuments({
            status: 'Rejected',
            approvalDate: { $gte: startOfToday },
          }),
          Voucher.find().sort({ updatedAt: -1 }).limit(6).populate('employee', 'name department'),
        ]);

      return res.status(200).json({
        success: true,
        role: 'director',
        stats: {
          pendingApprovalCount: pendingCount,
          approvedToday,
          rejectedToday,
          totalPendingAmount: pendingAmountAgg.length > 0 ? pendingAmountAgg[0].totalPending : 0,
        },
        recentActivity,
      });
    }

    if (role === 'accounts') {
      // 8.3 Accounts Dashboard
      // - Total Vouchers
      // - Pending Approval
      // - Approved Vouchers
      // - Rejected Vouchers
      // - Total Approved Expense Amount
      // - Recent Approved Vouchers
      const [total, pending, approved, rejected, approvedAmountAgg, recentApproved] =
        await Promise.all([
          Voucher.countDocuments(),
          Voucher.countDocuments({ status: 'Submitted' }),
          Voucher.countDocuments({ status: 'Approved' }),
          Voucher.countDocuments({ status: 'Rejected' }),
          Voucher.aggregate([
            { $match: { status: 'Approved' } },
            { $group: { _id: null, totalApproved: { $sum: '$amount' } } },
          ]),
          Voucher.find({ status: 'Approved' })
            .sort({ approvalDate: -1 })
            .limit(6)
            .populate('employee', 'name department employeeId'),
        ]);

      return res.status(200).json({
        success: true,
        role: 'accounts',
        stats: {
          totalVouchers: total,
          pendingApproval: pending,
          approvedVouchers: approved,
          rejectedVouchers: rejected,
          totalApprovedExpenseAmount:
            approvedAmountAgg.length > 0 ? approvedAmountAgg[0].totalApproved : 0,
        },
        recentApprovedVouchers: recentApproved,
      });
    }

    return res.status(400).json({ success: false, message: 'Invalid role for dashboard' });
  } catch (err) {
    next(err);
  }
};
