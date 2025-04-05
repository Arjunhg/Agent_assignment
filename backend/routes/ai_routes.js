const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateCampaign } = require('../controllers/ai_controller');

router.post('/generate-campaign', protect, generateCampaign);

module.exports = router;