const express = require('express');

const { createEvent, getEvents, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorizeRoles('admin'), createEvent);
router.get('/', protect, getEvents);
router.put('/:id', protect, authorizeRoles('admin'), updateEvent);
router.delete('/:id', protect, authorizeRoles('admin'), deleteEvent);

module.exports = router;
