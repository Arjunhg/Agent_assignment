const Contact = require('../models/Contact');


exports.getContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find()
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