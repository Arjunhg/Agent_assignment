const Campaign = require('../models/Campaign');

// Create a new campaign
exports.createCampaign = async (req, res, next) => {
  try {
    const {
      name,
      description,
      rewardType,
      rewardValue,
      discountCode,
      payoutMethod,
      status,
      startDate,
      endDate,
      aiFollowUpEnabled,
      followUpFrequency,
      customFollowUpDays
    } = req.body;

    if (!name || !rewardType || !rewardValue) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, reward type, and reward value'
      });
    }

    // If reward type is discount, ensure discount code exists
    if (rewardType === 'discount' && !discountCode) {
      return res.status(400).json({
        success: false,
        message: 'Discount code is required for discount reward type'
      });
    }

    // If reward type is payout, ensure payout method exists
    if (rewardType === 'payout' && !payoutMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payout method is required for payout reward type'
      });
    }

    const campaign = await Campaign.create({
      name,
      description,
      rewardType,
      rewardValue,
      discountCode,
      payoutMethod,
      status,
      startDate,
      endDate,
      createdBy: req.user.id,
      aiFollowUpEnabled,
      followUpFrequency,
      customFollowUpDays
    });

    res.status(201).json({
      success: true,
      data: campaign
    });
  } catch (err) {
    next(err);
  }
};

// Get all campaigns for the authenticated user
exports.getCampaigns = async (req, res, next) => {
  try {
    const campaigns = await Campaign.find({ createdBy: req.user.id });

    res.status(200).json({
      success: true,
      count: campaigns.length,
      data: campaigns
    });
  } catch (err) {
    next(err);
  }
};

// Get a single campaign by ID
exports.getCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check if the campaign belongs to the authenticated user
    if (campaign.createdBy.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this campaign'
      });
    }

    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (err) {
    next(err);
  }
};

// Update a campaign
exports.updateCampaign = async (req, res, next) => {
  try {
    let campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check if the campaign belongs to the authenticated user
    if (campaign.createdBy.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this campaign'
      });
    }

    // Update the updatedAt field
    req.body.updatedAt = Date.now();

    campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (err) {
    next(err);
  }
};

// Delete a campaign
exports.deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check if the campaign belongs to the authenticated user
    if (campaign.createdBy.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this campaign'
      });
    }

    await campaign.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
