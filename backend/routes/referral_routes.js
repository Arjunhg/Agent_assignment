const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const {
  createReferral,
  getReferrals,
  getReferral,
  trackReferralClick,
  addReferred,
  updateReferredStatus,
  deleteReferral
} = require('../controllers/referral_controller');

// Routes
router.route('/')
  .post(protect, createReferral)
  .get(protect, getReferrals);

router.route('/:id')
  .get(protect, getReferral)
  .delete(protect, deleteReferral);

router.route('/click/:referralCode')
  .post(trackReferralClick);

router.route('/refer/:referralCode')
  .post(addReferred);

router.route('/status')
  .put(protect, updateReferredStatus);

module.exports = router;
