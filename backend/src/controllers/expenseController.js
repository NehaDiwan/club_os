const mongoose = require('mongoose');

const Event = require('../models/Event');
const Expense = require('../models/Expense');
const asyncHandler = require('../middleware/asyncHandler');

const ensureEventAccess = async (eventId, user) => {
  const event = await Event.findById(eventId);

  if (!event) {
    throw new Error('Event not found');
  }

  const members = Array.isArray(event.members) ? event.members : [];
  const isMember = members.some((memberId) => memberId.toString() === user._id.toString());

  if (user.role !== 'admin' && !isMember) {
    throw new Error('You are not part of this event');
  }

  return event;
};

const createExpense = async (req, res, type) => {
  const { amount, description, eventId } = req.body;

  if (!amount || !description || !eventId) {
    res.status(400);
    throw new Error('Amount, description and eventId are required');
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    res.status(400);
    throw new Error('Amount must be a valid number greater than 0');
  }

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    res.status(400);
    throw new Error('Invalid eventId');
  }

  const event = await ensureEventAccess(eventId, req.user);
  if (req.user.role !== 'admin') {
    const members = Array.isArray(event.members) ? event.members : [];
    if (members.length === 0) {
      res.status(403);
      throw new Error('You are not part of this event');
    }
  }

  const billImage = req.file?.path || '';

  const expense = await Expense.create({
    type,
    amount: parsedAmount,
    description,
    billImage,
    userId: req.user._id,
    eventId,
    status: 'pending',
  });

  const populated = await Expense.findById(expense._id)
    .populate('userId', 'name email role')
    .populate('eventId', 'name date budget');

  res.status(201).json(populated);
};

const createPrepaidExpense = asyncHandler(async (req, res) => {
  await createExpense(req, res, 'prepaid');
});

const createPostpaidExpense = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Bill image is required for postpaid expenses');
  }

  await createExpense(req, res, 'postpaid');
});

const getMyExpenses = asyncHandler(async (req, res) => {
  const expenses = await Expense.find({ userId: req.user._id })
    .populate('eventId', 'name date budget')
    .sort({ createdAt: -1 });

  res.json(expenses);
});

const getAllExpenses = asyncHandler(async (req, res) => {
  const { eventId, status, type, search } = req.query;

  const query = {};

  if (eventId) {
    query.eventId = eventId;
  }

  if (status) {
    query.status = status;
  }

  if (type) {
    query.type = type;
  }

  if (search) {
    query.description = { $regex: search, $options: 'i' };
  }

  const expenses = await Expense.find(query)
    .populate('userId', 'name email role')
    .populate('eventId', 'name date budget')
    .sort({ createdAt: -1 });

  res.json(expenses);
});

const approveExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }

  if (expense.status !== 'pending') {
    res.status(400);
    throw new Error('Only pending expenses can be approved');
  }

  expense.status = 'approved';
  expense.reviewedBy = req.user._id;
  expense.reviewComment = req.body.comment || '';

  await expense.save();

  const populated = await Expense.findById(expense._id)
    .populate('userId', 'name email role')
    .populate('eventId', 'name date budget');

  res.json(populated);
});

const rejectExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }

  if (expense.status !== 'pending') {
    res.status(400);
    throw new Error('Only pending expenses can be rejected');
  }

  expense.status = 'rejected';
  expense.reviewedBy = req.user._id;
  expense.reviewComment = req.body.comment || '';

  await expense.save();

  const populated = await Expense.findById(expense._id)
    .populate('userId', 'name email role')
    .populate('eventId', 'name date budget');

  res.json(populated);
});

const completeExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }

  if (expense.status !== 'approved') {
    res.status(400);
    throw new Error('Only approved expenses can be marked completed');
  }

  const isOwner = expense.userId.toString() === req.user._id.toString();
  const canStudentComplete = req.user.role === 'student' && isOwner && expense.type === 'prepaid';

  if (req.user.role !== 'admin' && !canStudentComplete) {
    res.status(403);
    throw new Error('Not allowed to complete this expense');
  }

  const billImage = req.file?.path || req.body.billImage || expense.billImage;

  expense.billImage = billImage;
  expense.status = 'completed';
  expense.completedAt = new Date();
  expense.reviewedBy = req.user._id;

  await expense.save();

  const populated = await Expense.findById(expense._id)
    .populate('userId', 'name email role')
    .populate('eventId', 'name date budget');

  res.json(populated);
});

module.exports = {
  createPrepaidExpense,
  createPostpaidExpense,
  getMyExpenses,
  getAllExpenses,
  approveExpense,
  rejectExpense,
  completeExpense,
};
