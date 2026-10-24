const Voucher = require('../models/Voucher');

// @desc    Get metrics for current user based on their role
// @route   GET /api/dashboard/stats
// @access  Private (Employee, Director, Accounts)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const role = req.user?.role || 'employee';
    const userId = req.user?._id;
    const employeeId = req.user?.employeeId;
    const employeeName = req.user?.name;

    // Common aggregates across the company
    const totalOrgVouchers = await Voucher.countDocuments();
    const totalOrgAmountAgg = await Voucher.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalOrgAmount = totalOrgAmountAgg.length > 0 ? totalOrgAmountAgg[0].total : 0;

    if (role === 'employee') {
      // If user has specific vouchers linked, filter by user/name, else show company vouchers
      const userFilter = {};
      if (userId) {
        userFilter.$or = [
          { user: userId },
          ...(employeeId ? [{ employeeId }] : []),
          ...(employeeName ? [{ employeeName: new RegExp(`^${employeeName}$`, 'i') }] : []),
        ];
      }

      // Check if user has any vouchers matching
      const userCount = await Voucher.countDocuments(userFilter);
      const activeFilter = userCount > 0 ? userFilter : {};

      const [total, draft, pending, approved, rejected, amountAgg, recent] = await Promise.all([
        Voucher.countDocuments(activeFilter),
        Voucher.countDocuments({ ...activeFilter, status: 'Draft' }),
        Voucher.countDocuments({ ...activeFilter, status: { $in: ['Pending', 'Submitted'] } }),
        Voucher.countDocuments({ ...activeFilter, status: { $in: ['Approved', 'Paid'] } }),
        Voucher.countDocuments({ ...activeFilter, status: 'Rejected' }),
        Voucher.aggregate([
          { $match: activeFilter },
          { $group: { _id: null, totalClaimed: { $sum: '$amount' } } },
        ]),
        Voucher.find(activeFilter).sort({ createdAt: -1 }).limit(5),
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
      const [pendingCount, pendingAmountAgg, approvedToday, rejectedToday, recentActivity] =
        await Promise.all([
          Voucher.countDocuments({ status: { $in: ['Pending', 'Submitted'] } }),
          Voucher.aggregate([
            { $match: { status: { $in: ['Pending', 'Submitted'] } } },
            { $group: { _id: null, totalPending: { $sum: '$amount' } } },
          ]),
          Voucher.countDocuments({ status: { $in: ['Approved', 'Paid'] } }),
          Voucher.countDocuments({ status: 'Rejected' }),
          Voucher.find().sort({ updatedAt: -1 }).limit(6),
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
      const [total, pending, approved, rejected, approvedAmountAgg, recentApproved] =
        await Promise.all([
          Voucher.countDocuments(),
          Voucher.countDocuments({ status: { $in: ['Pending', 'Submitted'] } }),
          Voucher.countDocuments({ status: { $in: ['Approved', 'Paid'] } }),
          Voucher.countDocuments({ status: 'Rejected' }),
          Voucher.aggregate([
            { $match: { status: { $in: ['Approved', 'Paid'] } } },
            { $group: { _id: null, totalApproved: { $sum: '$amount' } } },
          ]),
          Voucher.find({ status: { $in: ['Approved', 'Paid'] } })
            .sort({ updatedAt: -1 })
            .limit(6),
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

    return res.status(200).json({
      success: true,
      role: 'general',
      stats: {
        totalVouchers: totalOrgVouchers,
        totalAmountClaimed: totalOrgAmount,
      },
    });
  } catch (err) {
    next(err);
  }
};
