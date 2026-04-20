const express = require('express');

const { register, login, listUsers } = require('../controllers/authController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/users', protect, authorizeRoles('admin'), listUsers);

module.exports = router;
