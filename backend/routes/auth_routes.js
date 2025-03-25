const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { login, getMe, logout , register } = require('../controllers/auth_controller');

// Routes
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post("/register", register );

module.exports = router;