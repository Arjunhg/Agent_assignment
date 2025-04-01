const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const { v4: uuidv4 } = require('uuid');
const Upload = require('../models/Upload');
const Contact = require('../models/Contact');
const Agent = require('../models/Agent');

exports.uploadCSV = async (req, res, next) => {
  try {
    const { contacts, fileName } = req.body;

    console.log('Upload request received:', {
      fileName,
      contactCount: contacts?.length || 0
    });

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid contacts provided'
      });
    }

    // Remove duplicates based on phone number
    const uniqueContacts = contacts.filter((contact, index, self) =>
      index === self.findIndex((c) => c.phone === contact.phone)
    );

    if (uniqueContacts.length !== contacts.length) {
      console.log(`Removed ${contacts.length - uniqueContacts.length} duplicate contacts`);
    }

    const batchId = uuidv4();
    const agents = await Agent.find({ createdBy: req.user.id });

    console.log('Found agents for current user:', {
      userId: req.user.id,
      agentCount: agents.length,
      agentIds: agents.map(a => a._id)
    });

    if (agents.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No agents found for your account. Please add agents first.'
      });
    }

    const baseCount = Math.floor(uniqueContacts.length / agents.length);
    const remainder = uniqueContacts.length % agents.length;

    console.log('Distribution calculation:', {
      totalContacts: uniqueContacts.length,
      baseCount,
      remainder
    });

    let distributedContacts = [];
    let currentIndex = 0;

    const distribution = agents.map((agent, index) => {
      const count = index < remainder ? baseCount + 1 : baseCount;
      const agentContacts = uniqueContacts.slice(currentIndex, currentIndex + count);
      currentIndex += count;

      console.log(`Agent ${agent.name} (${agent._id}):`, {
        assignedCount: count,
        contactRange: `${currentIndex - count} to ${currentIndex - 1}`
      });

      const contactObjects = agentContacts.map(contact => ({
        firstName: contact.firstName,
        phone: contact.phone,
        notes: contact.notes,
        assignedTo: agent._id,
        uploadedBy: req.user.id,
        batchId
      }));

      distributedContacts = [...distributedContacts, ...contactObjects];

      return {
        agent: agent._id,
        count,
        contacts: contactObjects
      };
    });

    console.log('Saving contacts to database...');
    // Save contacts and get their IDs
    const savedContacts = await Contact.insertMany(distributedContacts);
    console.log(`Saved ${savedContacts.length} contacts`);

    // Update agents with their assigned contacts
    console.log('Updating agents with assigned contacts...');
    const updatePromises = distribution.map(async (dist) => {
      if (dist.count > 0) {
        const contactIds = savedContacts
          .filter(contact => contact.assignedTo.toString() === dist.agent.toString())
          .map(contact => contact._id);

        console.log(`Updating agent ${dist.agent} with ${contactIds.length} contacts:`, contactIds);

        // Get current agent tasks
        const agent = await Agent.findById(dist.agent);
        const currentTasks = agent.tasks || [];
        
        // Combine current tasks with new tasks
        const updatedTasks = [...new Set([...currentTasks, ...contactIds])];
        
        // Update agent with combined tasks
        const updatedAgent = await Agent.findByIdAndUpdate(
          dist.agent,
          { $set: { tasks: updatedTasks } },
          { new: true }
        );

        console.log(`Agent ${dist.agent} tasks updated:`, {
          before: currentTasks.length,
          after: updatedAgent.tasks.length
        });

        return updatedAgent;
      }
    });

    await Promise.all(updatePromises);
    console.log('All agents updated successfully');

    res.status(201).json({
      success: true,
      data: {
        totalRecords: uniqueContacts.length,
        distribution: distribution.map((dist, index) => ({
          agent: {
            id: agents[index]._id,
            name: agents[index].name
          },
          count: dist.count
        }))
      }
    });
  } catch (err) {
    console.error('Error in uploadCSV:', err);
    next(err);
  }
};




