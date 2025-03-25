const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');


const { 
  getContacts, 
  getContactsByAgent, 
  updateContact,
  deleteContact
} = require('../controllers/contact_controller');

// Routes
router.get('/', protect,  getContacts );
router.get('/agent/:agentId', protect,  getContactsByAgent );
router.put('/:id', protect,  updateContact );
router.delete('/:id', protect,  deleteContact );

module.exports = router;