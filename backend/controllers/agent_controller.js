const Agent = require('../models/Agent');
const User = require("../models/User");
const Contact = require("../models/Contact");

exports.createAgent = async (req, res, next) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    req.body.createdBy = req.user._id; 

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, mobile, and password'
      });
    }

    const existingAgent = await Agent.findOne({ email });
    if (existingAgent) {
      return res.status(400).json({
        success: false,
        message: 'An agent with this email already exists'
      });
    }

    const existingMobile = await Agent.findOne({ mobile });
    if (existingMobile) {
      return res.status(400).json({
        success: false,
        message: 'An agent with this mobile number already exists'
      });
    }

    const agent = await Agent.create({
      name,
      email,
      mobile,
      password,
      createdBy: req.user._id 
    });

    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { agents: agent._id } }, 
      { new: true }
    );

    res.status(201).json({
      success: true,
      data: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        mobile: agent.mobile,
        createdBy: agent.createdBy,
        createdAt: agent.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getAgents = async (req, res, next) => {
  try {
    console.log(`Fetching agents for user: ${req.user.id}`);
    const agents = await Agent.find({ createdBy: req.user.id }).select('-password');

    console.log(`Found ${agents.length} agents for user ${req.user.id}`);

    if (!agents || agents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No agents found for this user.'
      });
    }

    res.status(200).json({
      success: true,
      data: agents
    });

  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.updateAgent = async (req, res, next) => {
  try {
    if (req.body.password) {
      delete req.body.password;
    }

    const agent = await Agent.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    ).select('-password');

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    res.status(200).json({
      success: true,
      data: agent
    });
  } catch (err) {
    next(err);
  }
};

exports.getAgentById = async (req, res, next) => {
  try {
    console.log(`Fetching agent with ID: ${req.params.id}`);
    
    // First get the agent without population to check tasks array
    const agentCheck = await Agent.findById(req.params.id);
    console.log('Initial agent check:', {
      agentId: agentCheck?._id,
      taskCount: agentCheck?.tasks?.length || 0,
      taskIds: agentCheck?.tasks || []
    });

    if (!agentCheck) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // If there are tasks, populate them
    if (agentCheck.tasks && agentCheck.tasks.length > 0) {
      const populatedAgent = await Agent.findById(req.params.id)
        .select('-password')
        .populate({
          path: 'tasks',
          model: 'Contact',
          select: 'firstName phone notes status completionNotes followUpStatus followUpDate followUpNotes createdAt'
        });

      console.log('Populated agent:', {
        agentId: populatedAgent._id,
        taskCount: populatedAgent.tasks?.length || 0,
        sampleTask: populatedAgent.tasks?.[0]
      });

      res.status(200).json({
        success: true,
        data: populatedAgent
      });
    } else {
      // If no tasks, return agent without population
      res.status(200).json({
        success: true,
        data: agentCheck
      });
    }
  } catch (err) {
    console.error('Error fetching agent by ID:', err);
    next(err);
  }
};

exports.deleteAgent = async (req, res, next) => {
  try {
    const agent = await Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    await agent.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

