const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const { 
  uploadCSV
} = require('../controllers/upload_controller');

// Routes
router.post('/', protect, uploadCSV);

module.exports = router;