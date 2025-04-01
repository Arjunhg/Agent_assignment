const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const { 
  getContacts, 
  getContactsByAgent, 
  updateContact,
  deleteContact,
  updateTaskStatus,
  getTaskStats,
  debugAgentContacts
} = require('../controllers/contact_controller');

// Routes
router.get('/', protect, getContacts);
router.get('/agent/:agentId', protect, getContactsByAgent);
router.get('/stats', protect, getTaskStats);
router.put('/:id', protect, updateContact);
router.put('/:id/status', protect, updateTaskStatus);
router.delete('/:id', protect, deleteContact);

// Debug route
router.get('/debug/agent/:agentId', protect, debugAgentContacts);

module.exports = router;