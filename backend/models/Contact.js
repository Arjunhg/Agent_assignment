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
    required: true
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

module.exports = mongoose.model('Contact', ContactSchema);