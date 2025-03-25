const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ReferralSchema = new mongoose.Schema({
  referralCode: {
    type: String,
    unique: true,
    default: () => uuidv4().substring(0, 8)
  },
  referralLink: {
    type: String,
    required: true,
    unique: true
  },
  referrer: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: false
    },
    phone: {
      type: String,
      required: false
    }
  },
  referred: [{
    name: {
      type: String
    },
    email: {
      type: String
    },
    phone: {
      type: String
    },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'converted', 'rejected'],
      default: 'pending'
    },
    dateReferred: {
      type: Date,
      default: Date.now
    }
  }],
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  linkClicks: {
    type: Number,
    default: 0
  },
  successful: {
    type: Number,
    default: 0
  },
  rewardEarned: {
    type: Boolean,
    default: false
  },
  rewardClaimed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Referral', ReferralSchema);
