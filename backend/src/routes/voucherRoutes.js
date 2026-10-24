const express = require('express');
const router = express.Router();
const {
  getVouchers,
  getVoucherById,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  submitVoucher,
  approveVoucher,
  rejectVoucher,
} = require('../controllers/voucherController');

// Voucher Collection Routes
router
  .route('/')
  .get(getVouchers)
  .post(createVoucher);

// Single Voucher Routes
router
  .route('/:id')
  .get(getVoucherById)
  .put(updateVoucher)
  .delete(deleteVoucher);

// Workflow endpoints
router.post('/:id/submit', submitVoucher);
router.post('/:id/approve', approveVoucher);
router.post('/:id/reject', rejectVoucher);

module.exports = router;
