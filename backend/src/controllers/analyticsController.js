const mongoose = require('mongoose');

const Event = require('../models/Event');
const Expense = require('../models/Expense');
const asyncHandler = require('../middleware/asyncHandler');

const getEventAnalytics = asyncHandler(async (req, res) => {
  const eventId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    res.status(400);
    throw new Error('Invalid event id');
  }

  const event = await Event.findById(eventId);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  const isMember = event.members.some((memberId) => memberId.toString() === req.user._id.toString());
  if (req.user.role !== 'admin' && !isMember) {
    res.status(403);
    throw new Error('Not allowed to view this event analytics');
  }

  const statusSummary = await Expense.aggregate([
    { $match: { eventId: event._id } },
    {
      $group: {
        _id: '$status',
        totalAmount: { $sum: '$amount' },
      },
    },
  ]);

  const monthlyTrends = await Expense.aggregate([
    { $match: { eventId: event._id } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        amount: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const statusMap = statusSummary.reduce((acc, current) => {
    acc[current._id] = current.totalAmount;
    return acc;
  }, {});

  const totalSpent = (statusMap.approved || 0) + (statusMap.completed || 0);
  const pendingAmount = statusMap.pending || 0;
  const approvedAmount = (statusMap.approved || 0) + (statusMap.completed || 0);

  const monthlyData = monthlyTrends.map((entry) => ({
    month: `${entry._id.year}-${String(entry._id.month).padStart(2, '0')}`,
    amount: entry.amount,
  }));

  res.json({
    event: {
      _id: event._id,
      name: event.name,
      budget: event.budget,
      date: event.date,
    },
    totals: {
      totalSpent,
      pendingAmount,
      approvedAmount,
    },
    byStatus: {
      pending: statusMap.pending || 0,
      approved: statusMap.approved || 0,
      rejected: statusMap.rejected || 0,
      completed: statusMap.completed || 0,
    },
    monthlyTrends: monthlyData,
  });
});

module.exports = {
  getEventAnalytics,
};
