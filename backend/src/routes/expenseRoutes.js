const express = require('express');

const {
  createPrepaidExpense,
  createPostpaidExpense,
  getMyExpenses,
  getAllExpenses,
  approveExpense,
  rejectExpense,
  completeExpense,
} = require('../controllers/expenseController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { uploadBillImage } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/prepaid', protect, authorizeRoles('student', 'admin'), uploadBillImage, createPrepaidExpense);
router.post('/postpaid', protect, authorizeRoles('student', 'admin'), uploadBillImage, createPostpaidExpense);
router.get('/my', protect, getMyExpenses);
router.get('/all', protect, authorizeRoles('admin'), getAllExpenses);
router.put('/:id/approve', protect, authorizeRoles('admin'), approveExpense);
router.put('/:id/reject', protect, authorizeRoles('admin'), rejectExpense);
router.put('/:id/complete', protect, uploadBillImage, completeExpense);

module.exports = router;
