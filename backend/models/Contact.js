const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed'],
    default: 'pending'
  },
  completionNotes: {
    type: String,
    trim: true
  },
  completionDate: {
    type: Date
  },
  followUpStatus: {
    type: String,
    enum: ['none', 'scheduled', 'completed', 'cancelled'],
    default: 'none'
  },
  followUpDate: {
    type: Date
  },
  followUpNotes: {
    type: String,
    trim: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true,
    validate: {
      validator: async function(agentId) {
        const Agent = mongoose.model('Agent');
        const agent = await Agent.findById(agentId);
        return agent !== null;
      },
      message: 'Invalid agent ID or agent does not exist'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  batchId: {
    type: String,
    required: true
  }
});

// Post-save hook to ensure agent's tasks array is updated
ContactSchema.post('save', async function(doc) {
  const Agent = mongoose.model('Agent');
  await Agent.findByIdAndUpdate(
    doc.assignedTo,
    { $addToSet: { tasks: doc._id } },
    { new: true }
  );
});

// Pre-remove hook to clean up agent's tasks array
ContactSchema.pre('remove', async function(next) {
  const Agent = mongoose.model('Agent');
  await Agent.findByIdAndUpdate(
    this.assignedTo,
    { $pull: { tasks: this._id } }
  );
  next();
});

// Handle task reassignment
ContactSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate();
  if (update && update.assignedTo) {
    const oldContact = await this.model.findOne(this.getQuery());
    if (oldContact && oldContact.assignedTo.toString() !== update.assignedTo.toString()) {
      const Agent = mongoose.model('Agent');
      // Remove from old agent
      await Agent.findByIdAndUpdate(
        oldContact.assignedTo,
        { $pull: { tasks: oldContact._id } }
      );
      // Add to new agent
      await Agent.findByIdAndUpdate(
        update.assignedTo,
        { $addToSet: { tasks: oldContact._id } }
      );
    }
  }
  next();
});

module.exports = mongoose.model('Contact', ContactSchema);