const Contact = require('../models/Contact');
const Agent = require('../models/Agent');

exports.getContacts = async (req, res, next) => {
  try {
    // Only get contacts uploaded by the current user
    const contacts = await Contact.find({ uploadedBy: req.user.id })
      .populate({
        path: 'assignedTo',
        select: 'name email'
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (err) {
    next(err);
  }
};

exports.updateContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (err) {
    next(err);
  }
};

exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { status, completionNotes, followUpStatus, followUpDate, followUpNotes } = req.body;
    
    const updateData = {
      status,
      ...(status === 'completed' && { completionDate: Date.now() }),
      ...(completionNotes && { completionNotes }),
      ...(followUpStatus && { followUpStatus }),
      ...(followUpDate && { followUpDate }),
      ...(followUpNotes && { followUpNotes })
    };

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (err) {
    next(err);
  }
};

exports.getContactsByAgent = async (req, res, next) => {
  try {
    // First verify the agent belongs to this user
    const agent = await Agent.findOne({ 
      _id: req.params.agentId,
      createdBy: req.user.id
    });
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found or not authorized'
      });
    }
    
    const contacts = await Contact.find({ assignedTo: req.params.agentId })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (err) {
    next(err);
  }
};

exports.getTaskStats = async (req, res, next) => {
  try {
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalTasks = stats.reduce((acc, curr) => acc + curr.count, 0);
    
    res.status(200).json({
      success: true,
      data: {
        stats,
        totalTasks
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    await contact.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

exports.debugAgentContacts = async (req, res, next) => {
  try {
    const { agentId } = req.params;
    
    // Find contacts assigned to this agent
    const contacts = await Contact.find({ assignedTo: agentId });
    
    // Find the agent to check its tasks field
    const agent = await Agent.findById(agentId).select('tasks');
    
    res.status(200).json({
      success: true,
      data: {
        contactsCount: contacts.length,
        contacts: contacts.map(c => ({ id: c._id, name: c.firstName })),
        agentTasksCount: agent?.tasks?.length || 0,
        agentTasks: agent?.tasks || []
      }
    });
  } catch (err) {
    next(err);
  }
};