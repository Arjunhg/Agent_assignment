const Analytics = require('../models/Analytics');
const Referral = require('../models/Referral');
const Campaign = require('../models/Campaign');
const Reward = require('../models/Reward');
const Message = require('../models/Message');

// Get analytics for all campaigns
exports.getAnalytics = async (req, res, next) => {
  try {
    const analytics = await Analytics.find({ business: req.user.id })
      .populate('campaign', 'name')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: analytics.length,
      data: analytics
    });
  } catch (err) {
    next(err);
  }
};

// Get analytics for a specific campaign
exports.getCampaignAnalytics = async (req, res, next) => {
  try {
    const analytics = await Analytics.find({
      business: req.user.id,
      campaign: req.params.campaignId
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: analytics.length,
      data: analytics
    });
  } catch (err) {
    next(err);
  }
};

// Generate analytics for all campaigns
exports.generateAnalytics = async (req, res, next) => {
  try {
    // Get all campaigns for the user
    const campaigns = await Campaign.find({ createdBy: req.user.id });

    if (!campaigns || campaigns.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No campaigns found'
      });
    }

    const analyticsPromises = campaigns.map(async (campaign) => {
      // Get all referrals for this campaign
      const referrals = await Referral.find({ campaign: campaign._id });
      
      // Get all rewards for this campaign
      const rewards = await Reward.find({ campaign: campaign._id });
      
      // Get all messages for this campaign
      const messages = await Message.find({ campaign: campaign._id, status: 'sent' });

      // Calculate real metrics based on actual data
      const linkClicks = referrals.reduce((sum, ref) => sum + ref.linkClicks, 0);
      const referralCount = referrals.length;
      const conversionsCount = referrals.reduce((sum, ref) => 
        sum + ref.referred.filter(r => r.status === 'converted').length, 0);
      
      const conversionRate = referralCount > 0 
        ? (conversionsCount / referralCount) * 100 
        : 0;
      
      const rewardsIssued = rewards.length;
      const rewardsPaid = rewards.filter(r => r.status === 'paid').length;
      const messagesSent = messages.length;

      // Calculate sources
      const smsMessages = messages.filter(m => m.type === 'sms').length;
      const emailMessages = messages.filter(m => m.type === 'email').length;
      const socialMessages = 0; // Social sharing functionality not implemented yet

      // Find existing analytics record for today or create a new one
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Look for an existing analytics record for this campaign from today
      let analyticsRecord = await Analytics.findOne({
        business: req.user.id,
        campaign: campaign._id,
        date: { $gte: today }
      });
      
      if (analyticsRecord) {
        // Update existing record
        analyticsRecord.metrics = {
          linkClicks,
          referrals: referralCount,
          conversions: conversionsCount,
          conversionRate,
          rewardsIssued,
          rewardsPaid,
          messagesSent
        };
        analyticsRecord.source = {
          sms: smsMessages,
          email: emailMessages,
          social: socialMessages
        };
        analyticsRecord.updatedAt = Date.now();
        
        await analyticsRecord.save();
        return analyticsRecord;
      } else {
        // Create new record if none exists for today
        return Analytics.create({
          business: req.user.id,
          campaign: campaign._id,
          date: Date.now(),
          metrics: {
            linkClicks,
            referrals: referralCount,
            conversions: conversionsCount,
            conversionRate,
            rewardsIssued,
            rewardsPaid,
            messagesSent
          },
          source: {
            sms: smsMessages,
            email: emailMessages,
            social: socialMessages
          }
        });
      }
    });

    const results = await Promise.all(analyticsPromises);

    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (err) {
    next(err);
  }
};
