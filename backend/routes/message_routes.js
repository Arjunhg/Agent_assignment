const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const {
  createMessage,
  getMessages,
  getMessage,
  sendMessage,
  bulkImportAndSend
} = require('../controllers/message_controller');

// Routes
router.route('/')
  .post(protect, createMessage)
  .get(protect, getMessages);

router.route('/:id')
  .get(protect, getMessage);

router.route('/:id/send')
  .post(protect, sendMessage);

router.route('/bulk')
  .post(protect, bulkImportAndSend);

module.exports = router;
