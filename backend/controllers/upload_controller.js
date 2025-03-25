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

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid contacts provided'
      });
    }

    const batchId = uuidv4();
    const agents = await Agent.find();

    if (agents.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No agents found. Please add agents first.'
      });
    }

    const baseCount = Math.floor(contacts.length / agents.length);
    const remainder = contacts.length % agents.length;

    let distributedContacts = [];
    let currentIndex = 0;

    const agentTasksMap = new Map(); 

    const distribution = agents.map((agent, index) => {
      const count = index < remainder ? baseCount + 1 : baseCount;
      const agentContacts = contacts.slice(currentIndex, currentIndex + count);
      currentIndex += count;

      const contactObjects = agentContacts.map(contact => ({
        firstName: contact.firstName,
        phone: contact.phone,
        notes: contact.notes,
        assignedTo: agent._id,
        uploadedBy: req.user.id,
        batchId
      }));

      distributedContacts = [...distributedContacts, ...contactObjects];

      agentTasksMap.set(agent._id.toString(), []);

      return {
        agent: agent._id,
        count
      };
    });


    const savedContacts = await Contact.insertMany(distributedContacts);


    savedContacts.forEach(contact => {
      if (agentTasksMap.has(contact.assignedTo.toString())) {
        agentTasksMap.get(contact.assignedTo.toString()).push(contact._id);
      }
    });


    const updatePromises = [];
    for (let [agentId, contactIds] of agentTasksMap) {
      updatePromises.push(
        Agent.findByIdAndUpdate(agentId, { $push: { tasks: { $each: contactIds } } })
      );
    }
    await Promise.all(updatePromises);


    res.status(201).json({
      success: true,
      data: {
        totalRecords: contacts.length,
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
    console.error(err);
    next(err);
  }
};




