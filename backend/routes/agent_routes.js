const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');


const { 
  createAgent, 
  getAgents, 
  getAgentById, 
  updateAgent, 
  deleteAgent 
} = require('../controllers/agent_controller');

// Routes
router.route('/')
  .post(protect,  createAgent )
  .get(protect,  getAgents );

router.route('/:id')
  .get(protect,  getAgentById )
  .put(protect, updateAgent )
  .delete(protect, deleteAgent );

module.exports = router;

