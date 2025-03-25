const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const {
  getAnalytics,
  getCampaignAnalytics,
  generateAnalytics
} = require('../controllers/analytics_controller');

// Routes
router.route('/')
  .get(protect, getAnalytics);

router.route('/campaign/:campaignId')
  .get(protect, getCampaignAnalytics);

router.route('/generate')
  .post(protect, generateAnalytics);

module.exports = router;
