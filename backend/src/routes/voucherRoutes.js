const express = require('express');
const router = express.Router();
const {
  createVoucher,
  updateVoucher,
  deleteVoucher,
  submitVoucher,
  getVouchers,
  getVoucherById,
  approveVoucher,
  rejectVoucher,
} = require('../controllers/voucherController');
const { protect, authorize } = require('../middleware/auth');

// Protected for all authenticated users
router.use(protect);

// Voucher collection routes
router
  .route('/')
  .get(getVouchers)
  .post(createVoucher);

// Single voucher routes
router
  .route('/:id')
  .get(getVoucherById)
  .put(updateVoucher)
  .delete(deleteVoucher);

// Workflow state transition routes
router.post('/:id/submit', authorize('employee'), submitVoucher);
router.post('/:id/approve', authorize('director'), approveVoucher);
router.post('/:id/reject', authorize('director'), rejectVoucher);

module.exports = router;
