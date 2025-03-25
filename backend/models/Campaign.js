const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Campaign name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  rewardType: {
    type: String,
    enum: ['discount', 'payout'],
    required: [true, 'Reward type is required']
  },
  rewardValue: {
    type: Number,
    required: [true, 'Reward value is required']
  },
  discountCode: {
    type: String,
    trim: true
  },
  payoutMethod: {
    type: String,
    enum: ['ach', 'venmo', 'paypal'],
    default: 'ach'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'draft'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  referralCount: {
    type: Number,
    default: 0
  },
  conversionRate: {
    type: Number,
    default: 0
  },
  aiFollowUpEnabled: {
    type: Boolean,
    default: true
  },
  followUpFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'custom'],
    default: 'weekly'
  },
  customFollowUpDays: {
    type: Number
  }
});

module.exports = mongoose.model('Campaign', CampaignSchema);
