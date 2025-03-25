const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  metrics: {
    linkClicks: {
      type: Number,
      default: 0
    },
    referrals: {
      type: Number,
      default: 0
    },
    conversions: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    rewardsIssued: {
      type: Number,
      default: 0
    },
    rewardsPaid: {
      type: Number,
      default: 0
    },
    messagesSent: {
      type: Number,
      default: 0
    }
  },
  source: {
    sms: {
      type: Number,
      default: 0
    },
    email: {
      type: Number,
      default: 0
    },
    social: {
      type: Number,
      default: 0
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);
