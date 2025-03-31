const Referral = require('../models/Referral');
const Campaign = require('../models/Campaign');
const { v4: uuidv4 } = require('uuid');

// Create a new referral
exports.createReferral = async (req, res, next) => {
  try {
    const { campaignId, referrer, referred } = req.body;

    if (!campaignId || !referrer || !referred) {
      return res.status(400).json({
        success: false,
        message: 'Please provide campaign ID, referrer, and referred details'
      });
    }

    // Find the campaign
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check if campaign is active
    const now = new Date();
    const isActive = campaign.status === 'active' &&
      (!campaign.startDate || campaign.startDate <= now) &&
      (!campaign.endDate || campaign.endDate >= now);

    if (!isActive) {
      return res.status(400).json({
        success: false,
        message: 'This campaign is not currently active'
      });
    }

    // Generate unique referral code and link
    const referralCode = uuidv4().substring(0, 8);
    const referralLink = `${process.env.FRONTEND_URL}/refer?code=${referralCode}`;

    // Create the referral
    const referral = await Referral.create({
      referralCode,
      referralLink,
      referrer,
      referred: [{
        ...referred,
        status: 'pending'
      }],
      campaign: campaignId,
      business: req.user.id
    });

    // Update campaign referral count
    campaign.referralCount += 1;
    await campaign.save();

    res.status(201).json({
      success: true,
      data: referral
    });
  } catch (err) {
    next(err);
  }
};

// Track referral link click
exports.trackReferralClick = async (req, res, next) => {
  try {
    const { referralCode } = req.params;

    const referral = await Referral.findOne({ referralCode });

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found'
      });
    }

    // Increment link clicks
    referral.linkClicks += 1;
    referral.updatedAt = Date.now();
    await referral.save();

    res.status(200).json({
      success: true,
      data: {
        referral
      }
    });
  } catch (err) {
    next(err);
  }
};

// Add a referred person to a referral
exports.addReferred = async (req, res, next) => {
  try {
    const { referralCode } = req.params;
    const { name, email, phone } = req.body;

    if (!name || (!email && !phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and either email or phone'
      });
    }

    const referral = await Referral.findOne({ referralCode });

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found'
      });
    }

    // Add referred person
    referral.referred.push({
      name,
      email,
      phone,
      status: 'pending',
      dateReferred: Date.now()
    });

    // Increment successful referrals
    referral.successful += 1;
    referral.updatedAt = Date.now();
    
    await referral.save();

    // Update campaign referral count
    await Campaign.findByIdAndUpdate(
      referral.campaign,
      { $inc: { referralCount: 1 } }
    );

    res.status(200).json({
      success: true,
      data: referral
    });
  } catch (err) {
    next(err);
  }
};

// Get all referrals for a business
exports.getReferrals = async (req, res, next) => {
  try {
    const referrals = await Referral.find({ business: req.user.id })
      .populate('campaign', 'name rewardType rewardValue')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: referrals.length,
      data: referrals
    });
  } catch (err) {
    next(err);
  }
};

// Get a single referral by ID
exports.getReferral = async (req, res, next) => {
  try {
    const referral = await Referral.findById(req.params.id)
      .populate('campaign', 'name rewardType rewardValue');

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
        message: 'Not authorized to access this referral'
      });
    }

    res.status(200).json({
      success: true,
      data: referral
    });
  } catch (err) {
    next(err);
  }
};

// Update referred person status
exports.updateReferredStatus = async (req, res, next) => {
  try {
    const { referralId, referredId, status } = req.body;

    if (!referralId || !referredId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide referral ID, referred ID, and status'
      });
    }

    const validStatuses = ['pending', 'contacted', 'converted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const referral = await Referral.findById(referralId);

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
        message: 'Not authorized to update this referral'
      });
    }

    // Find and update the specific referred person
    const referredPerson = referral.referred.id(referredId);
    if (!referredPerson) {
      return res.status(404).json({
        success: false,
        message: 'Referred person not found'
      });
    }

    // If status is changing to converted and wasn't before, update the reward status
    if (status === 'converted' && referredPerson.status !== 'converted') {
      referral.rewardEarned = true;
    }

    referredPerson.status = status;
    referral.updatedAt = Date.now();
    await referral.save();

    res.status(200).json({
      success: true,
      data: referral
    });
  } catch (err) {
    next(err);
  }
};
