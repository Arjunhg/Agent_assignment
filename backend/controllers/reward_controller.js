const Reward = require('../models/Reward');
const Referral = require('../models/Referral');
const Campaign = require('../models/Campaign');
const { sendEmail } = require('../services/emailService');

// Create a new reward
exports.createReward = async (req, res, next) => {
  try {
    const { referralId, payoutMethod, payoutDetails } = req.body;

    if (!referralId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide referral ID'
      });
    }

    // Find the referral
    const referral = await Referral.findById(referralId)
      .populate('campaign');

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found'
      });
    }

    // Check if the referral belongs to the authenticated user
    if (referral.business.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to create rewards for this referral'
      });
    }

    // Check if the referral has earned a reward
    if (!referral.rewardEarned) {
      return res.status(400).json({
        success: false,
        message: 'This referral has not earned a reward yet'
      });
    }

    // Check if reward already exists
    const existingReward = await Reward.findOne({ referral: referralId });
    if (existingReward) {
      return res.status(400).json({
        success: false,
        message: 'Reward already exists for this referral'
      });
    }

    // Check conversion requirements
    const conversions = referral.referred.filter(r => r.status === 'converted').length;
    if (conversions < referral.campaign.requiredConversions) {
      return res.status(400).json({
        success: false,
        message: `Need ${referral.campaign.requiredConversions} conversions, has ${conversions}`
      });
    }

    // Create the reward
    const reward = await Reward.create({
      referrer: referral.referrer,
      referral: referralId,
      campaign: referral.campaign._id,
      business: req.user.id,
      type: referral.campaign.rewardType,
      value: referral.campaign.rewardValue,
      discountCode: referral.campaign.rewardType === 'discount' ? referral.campaign.discountCode : undefined,
      payoutMethod: payoutMethod || referral.campaign.payoutMethod,
      payoutDetails: payoutDetails || {},
      status: 'pending'
    });

    // Update referral to mark reward as claimed
    referral.rewardClaimed = true;
    await referral.save();

    // Notify referrer
    if (referral.referrer.email) {
      await sendEmail(
        referral.referrer.email,
        'rewardCreated',
        [reward.type, reward.value, referral.campaign.name]
      );
    }

    res.status(201).json({
      success: true,
      data: reward
    });
  } catch (err) {
    next(err);
  }
};

// Get all rewards for a business
exports.getRewards = async (req, res, next) => {
  try {
    const rewards = await Reward.find({ business: req.user.id })
      .populate('referral', 'referralCode')
      .populate('campaign', 'name')
      .sort({ dateEarned: -1 });

    res.status(200).json({
      success: true,
      count: rewards.length,
      data: rewards
    });
  } catch (err) {
    next(err);
  }
};

// Get a single reward by ID
exports.getReward = async (req, res, next) => {
  try {
    // Special handling for "new" route
    if (req.params.id === 'new') {
      return res.status(404).json({
        success: false,
        message: 'Invalid reward ID. "new" is not a valid ID.'
      });
    }

    const reward = await Reward.findById(req.params.id)
      .populate('referral')
      .populate('campaign');

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }

    // Check if the reward belongs to the authenticated user
    if (reward.business.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this reward'
      });
    }

    res.status(200).json({
      success: true,
      data: reward
    });
  } catch (err) {
    next(err);
  }
};

// Update a reward's status
exports.updateRewardStatus = async (req, res, next) => {
  try {
    const { status, transactionId } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status'
      });
    }

    const validStatuses = ['pending', 'approved', 'rejected', 'paid'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const reward = await Reward.findById(req.params.id);

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }

    // Check if the reward belongs to the authenticated user
    if (reward.business.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this reward'
      });
    }

    // Update the reward
    reward.status = status;
    
    // If status is paid, record payment date and transaction ID
    if (status === 'paid') {
      reward.datePaid = Date.now();
      if (transactionId) {
        reward.transactionId = transactionId;
      }
    }

    await reward.save();

    res.status(200).json({
      success: true,
      data: reward
    });
  } catch (err) {
    next(err);
  }
};

// Get template data for creating a new reward
exports.getNewRewardForm = async (req, res, next) => {
  try {
    const { referralId } = req.query;
    
    if (!referralId) {
      return res.status(400).json({
        success: false,
        message: 'Referral ID is required to create a new reward'
      });
    }
    
    // Get the referral data
    const referral = await Referral.findById(referralId)
      .populate('campaign');
      
    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found'
      });
    }
    
    // Check if the referral belongs to the user
    if (referral.business.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to create rewards for this referral'
      });
    }
    
    // Check if a reward already exists for this referral
    const existingReward = await Reward.findOne({ referral: referralId });
    if (existingReward) {
      // Return the existing reward instead
      return res.status(200).json({
        success: true,
        data: existingReward,
        message: 'A reward already exists for this referral'
      });
    }
    
    // Create a template for the new reward
    const rewardTemplate = {
      referrer: referral.referrer,
      referralId,
      campaign: {
        _id: referral.campaign._id,
        name: referral.campaign.name
      },
      type: referral.campaign.rewardType,
      value: referral.campaign.rewardValue,
      status: 'pending'
    };
    
    res.status(200).json({
      success: true,
      data: rewardTemplate,
      isTemplate: true
    });
  } catch (err) {
    next(err);
  }
};
