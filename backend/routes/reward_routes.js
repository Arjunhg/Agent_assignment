const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const {
  createReward,
  getRewards,
  getReward,
  updateRewardStatus,
  getNewRewardForm
} = require('../controllers/reward_controller');

// Routes
router.route('/')
  .post(protect, createReward)
  .get(protect, getRewards);

// Special route for new reward form
router.route('/new')
  .get(protect, getNewRewardForm);

router.route('/:id')
  .get(protect, getReward)
  .put(protect, updateRewardStatus);

module.exports = router;
