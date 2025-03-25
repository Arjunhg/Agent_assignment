const mongoose = require('mongoose');

const UploadSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  batchId: {
    type: String,
    required: true
  },
  totalRecords: {
    type: Number,
    required: true
  },
  distribution: [{
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent'
    },
    count: {
      type: Number,
      default: 0
    }
  }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Upload', UploadSchema);