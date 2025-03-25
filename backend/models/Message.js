const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['email', 'sms'],
    required: true
  },
  subject: {
    type: String,
    required: function() { return this.type === 'email'; }
  },
  content: {
    type: String,
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipients: [{
    type: String,
    required: true
  }],
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sent', 'failed'],
    default: 'draft'
  },
  scheduledFor: {
    type: Date
  },
  sentAt: {
    type: Date
  },
  bulkSend: {
    type: Boolean,
    default: false
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', MessageSchema);
