const express = require('express');

const { getEventAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/event/:id', protect, getEventAnalytics);

module.exports = router;
