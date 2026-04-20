const mongoose = require('mongoose');

const Event = require('../models/Event');
const Expense = require('../models/Expense');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

const createEvent = asyncHandler(async (req, res) => {
  const { name, date, budget, memberIds = [] } = req.body;

  if (!name || !date || budget === undefined) {
    res.status(400);
    throw new Error('Name, date and budget are required');
  }

  const uniqueMembers = [...new Set(memberIds)].filter((id) => mongoose.Types.ObjectId.isValid(id));

  const allMembers = [...new Set([req.user._id.toString(), ...uniqueMembers])];

  const event = await Event.create({
    name,
    date,
    budget,
    members: allMembers,
    createdBy: req.user._id,
  });

  await User.updateMany(
    { _id: { $in: allMembers } },
    { $addToSet: { events: event._id } }
  );

  const populatedEvent = await Event.findById(event._id).populate('members', 'name email role');

  res.status(201).json(populatedEvent);
});

const getEvents = asyncHandler(async (req, res) => {
  let events;

  if (req.user.role === 'admin') {
    events = await Event.find()
      .populate('members', 'name email role')
      .populate('createdBy', 'name email role')
      .sort({ date: -1 });
  } else {
    events = await Event.find({ members: req.user._id })
      .populate('members', 'name email role')
      .populate('createdBy', 'name email role')
      .sort({ date: -1 });
  }

  res.json(events);
});

const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  const { name, date, budget, memberIds } = req.body;

  if (name !== undefined) {
    event.name = name;
  }

  if (date !== undefined) {
    event.date = date;
  }

  if (budget !== undefined) {
    event.budget = budget;
  }

  if (memberIds !== undefined) {
    const existingMemberIds = event.members.map((memberId) => memberId.toString());
    const requestedMemberIds = Array.isArray(memberIds)
      ? memberIds.filter((id) => mongoose.Types.ObjectId.isValid(id))
      : [];

    const nextMemberIds = [...new Set([req.user._id.toString(), ...requestedMemberIds])];
    const removedMemberIds = existingMemberIds.filter((id) => !nextMemberIds.includes(id));

    event.members = nextMemberIds;

    if (nextMemberIds.length) {
      await User.updateMany(
        { _id: { $in: nextMemberIds } },
        { $addToSet: { events: event._id } }
      );
    }

    if (removedMemberIds.length) {
      await User.updateMany(
        { _id: { $in: removedMemberIds } },
        { $pull: { events: event._id } }
      );
    }
  }

  await event.save();

  const populatedEvent = await Event.findById(event._id)
    .populate('members', 'name email role')
    .populate('createdBy', 'name email role');

  res.json(populatedEvent);
});

const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  const forceDelete = req.query.force === 'true';

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  const linkedExpenses = await Expense.countDocuments({ eventId: event._id });
  if (linkedExpenses > 0 && !forceDelete) {
    res.status(400);
    throw new Error('Cannot delete event with existing expenses');
  }

  let deletedExpenseCount = 0;
  if (linkedExpenses > 0 && forceDelete) {
    const deletedExpenses = await Expense.deleteMany({ eventId: event._id });
    deletedExpenseCount = deletedExpenses.deletedCount || 0;
  }

  await event.deleteOne();
  await User.updateMany({ events: event._id }, { $pull: { events: event._id } });

  res.json({
    message: forceDelete ? 'Event and linked expenses deleted' : 'Event deleted',
    deletedExpenseCount,
  });
});

module.exports = {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
};
