const Campaign = require('../models/Campaign');

// Helper function to check if campaign is active
const isCampaignActive = (campaign) => {
  const now = new Date();
  return (
    campaign.status === 'active' &&
    (!campaign.startDate || campaign.startDate <= now) &&
    (!campaign.endDate || campaign.endDate >= now)
  );
};

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

    // Validate dates
    if (startDate && endDate && startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    const campaign = await Campaign.create({
      name,
      description,
      rewardType,
      rewardValue,
      discountCode,
      payoutMethod,
      status: status || 'draft',
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
    
    // Update campaign statuses based on dates
    for (const campaign of campaigns) {
      const isActive = isCampaignActive(campaign);
      if (campaign.status === 'active' && !isActive) {
        campaign.status = 'inactive';
        await campaign.save();
      }
    }

    res.status(200).json({
      success: true,
      count: campaigns.length,
      data: campaigns
    });
  } catch (err) {
    next(err);
  }
};

// Get a single campaign
exports.getCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check if user owns the campaign
    if (campaign.createdBy.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this campaign'
      });
    }

    // Update campaign status based on dates
    const isActive = isCampaignActive(campaign);
    if (campaign.status === 'active' && !isActive) {
      campaign.status = 'inactive';
      await campaign.save();
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
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check if user owns the campaign
    if (campaign.createdBy.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this campaign'
      });
    }

    // Validate dates if provided
    if (req.body.startDate && req.body.endDate && req.body.startDate > req.body.endDate) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // If changing to active status, validate required fields
    if (req.body.status === 'active') {
      if (!campaign.rewardType || !campaign.rewardValue) {
        return res.status(400).json({
          success: false,
          message: 'Campaign must have reward type and value to be activated'
        });
      }

      if (campaign.rewardType === 'discount' && !campaign.discountCode) {
        return res.status(400).json({
          success: false,
          message: 'Discount campaigns must have a discount code to be activated'
        });
      }

      if (campaign.rewardType === 'payout' && !campaign.payoutMethod) {
        return res.status(400).json({
          success: false,
          message: 'Payout campaigns must have a payout method to be activated'
        });
      }
    }

    const updatedCampaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedCampaign
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

    // Check if user owns the campaign
    if (campaign.createdBy.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this campaign'
      });
    }

    // Prevent deletion of active campaigns
    if (campaign.status === 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an active campaign. Please deactivate it first.'
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
