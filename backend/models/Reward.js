const mongoose = require('mongoose');

const RewardSchema = new mongoose.Schema({
  referrer: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String
    },
    phone: {
      type: String
    }
  },
  referral: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Referral',
    required: true
  },
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
  type: {
    type: String,
    enum: ['discount', 'payout'],
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  discountCode: {
    type: String
  },
  payoutMethod: {
    type: String,
    enum: ['ach', 'venmo', 'paypal']
  },
  payoutDetails: {
    accountNumber: String,
    routingNumber: String,
    venmoId: String,
    paypalEmail: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'paid'],
    default: 'pending'
  },
  dateEarned: {
    type: Date,
    default: Date.now
  },
  datePaid: {
    type: Date
  },
  transactionId: {
    type: String
  }
});

module.exports = mongoose.model('Reward', RewardSchema);
