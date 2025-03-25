const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const {
  createCampaign,
  getCampaigns,
  getCampaign,
  updateCampaign,
  deleteCampaign
} = require('../controllers/campaign_controller');

// Routes
router.route('/')
  .post(protect, createCampaign)
  .get(protect, getCampaigns);

router.route('/:id')
  .get(protect, getCampaign)
  .put(protect, updateCampaign)
  .delete(protect, deleteCampaign);

module.exports = router;
