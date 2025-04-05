const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const { v4: uuidv4 } = require('uuid');
const Upload = require('../models/Upload');
const Contact = require('../models/Contact');
const Agent = require('../models/Agent');
const { getOptimalAgentDistribution } = require('../services/taskDistribution');

const validateAndDedupContacts = async (contacts) => {
  return contacts.map(contact => ({
    firstName: contact.firstName || contact.name || '',
    phone: contact.phone || contact.Phone || '',
    email: contact.email || contact.Email || '',
    notes: contact.notes || ''
  })).filter(contact => contact.firstName && contact.phone);
};

// Export the uploadCSV function
exports.uploadCSV = async (req, res, next) => {
  try {
    const { contacts } = req.body;
    
    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide contacts array'
      });
    }

    // Get all available agents for the current user
    const agents = await Agent.find({ createdBy: req.user.id });
    
    if (!agents || agents.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No agents available. Please add agents first.'
      });
    }

    // Generate batch ID for this upload
    const batchId = new Date().getTime().toString();

    // Validate and standardize contacts
    const validContacts = await validateAndDedupContacts(contacts);

    // Get optimal distribution of contacts to agents
    const distribution = await getOptimalAgentDistribution(validContacts, agents);
    const createdContacts = [];

    // Create contacts and assign to agents
    for (const [agentId, agentContacts] of distribution) {
      const contactsToCreate = agentContacts.map(contact => ({
        ...contact,
        assignedTo: agentId,
        uploadedBy: req.user.id,
        batchId,
        status: 'pending'
      }));

      // Create contacts in bulk
      const newContacts = await Contact.insertMany(contactsToCreate);
      createdContacts.push(...newContacts);

      // Update agent's tasks array
      await Agent.findByIdAndUpdate(
        agentId,
        { $push: { tasks: { $each: newContacts.map(c => c._id) } } },
        { new: true }
      );
    }

    // Create upload record
    await Upload.create({
      fileName: req.body.fileName || 'bulk-upload',
      batchId,
      totalRecords: createdContacts.length,
      distribution: Array.from(distribution.entries()).map(([agent, contacts]) => ({
        agent,
        count: contacts.length
      })),
      uploadedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: {
        totalContacts: createdContacts.length,
        batchId
      }
    });
  } catch (err) {
    console.error('Upload error:', err);
    next(err);
  }
};

exports.uploadContacts = async (req, res, next) => {
  try {
    const { contacts } = req.body;
    
    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide contacts array'
      });
    }

    // Get all available agents for the current user
    const agents = await Agent.find({ createdBy: req.user.id });
    
    if (!agents || agents.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No agents available. Please add agents first.'
      });
    }

    // Generate batch ID for this upload
    const batchId = new Date().getTime().toString();

    // Validate and standardize contacts
    const validContacts = await validateAndDedupContacts(contacts);

    // Get optimal distribution of contacts to agents
    const distribution = await getOptimalAgentDistribution(validContacts, agents);
    const createdContacts = [];

    // Create contacts and assign to agents
    for (const [agentId, agentContacts] of distribution) {
      const contactsToCreate = agentContacts.map(contact => ({
        ...contact,
        assignedTo: agentId,
        uploadedBy: req.user.id,
        batchId,
        status: 'pending'
      }));

      // Create contacts in bulk
      const newContacts = await Contact.insertMany(contactsToCreate);
      createdContacts.push(...newContacts);

      // Update agent's tasks array
      await Agent.findByIdAndUpdate(
        agentId,
        { $push: { tasks: { $each: newContacts.map(c => c._id) } } },
        { new: true }
      );
    }

    // Create upload record
    await Upload.create({
      fileName: req.body.fileName || 'bulk-upload',
      batchId,
      totalRecords: createdContacts.length,
      distribution: Array.from(distribution.entries()).map(([agent, contacts]) => ({
        agent,
        count: contacts.length
      })),
      uploadedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: {
        totalContacts: createdContacts.length,
        batchId
      }
    });
  } catch (err) {
    console.error('Upload error:', err);
    next(err);
  }
};

// Add single contact
exports.addContact = async (req, res, next) => {
  try {
    const contact = req.body;
    
    if (!contact.firstName || (!contact.email && !contact.phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide firstName and either email or phone'
      });
    }

    // Get all available agents
    const agents = await Agent.find({ createdBy: req.user.id });
    
    if (!agents || agents.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No agents available. Please add agents first.'
      });
    }

    const batchId = new Date().getTime().toString();

    // Use the distribution service for single contact
    const distribution = await getOptimalAgentDistribution([contact], agents);
    const [[agentId]] = distribution; // Get first (and only) agent-contacts pair

    // Create new contact
    const newContact = await Contact.create({
      ...contact,
      assignedTo: agentId,
      uploadedBy: req.user.id,
      batchId,
      status: 'pending'
    });

    // Update agent's tasks array
    await Agent.findByIdAndUpdate(
      agentId,
      { $push: { tasks: newContact._id } },
      { new: true }
    );

    res.status(201).json({
      success: true,
      data: newContact
    });
  } catch (err) {
    next(err);
  }
};




