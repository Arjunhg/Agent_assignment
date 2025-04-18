const Referral = require('../models/Referral');
const Campaign = require('../models/Campaign');
const { v4: uuidv4 } = require('uuid');
const { sendEmail } = require('../services/emailService');

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
    const baseUrl = process.env.FRONTEND_URL.replace(/\/$/, ''); // Remove trailing slash if present
    const referralLink = `${baseUrl}/refer/${referralCode}`;

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

    const referral = await Referral.findOne({ referralCode })
      .populate('campaign', 'name rewardType rewardValue');

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

    // Send welcome email if email is provided
    if (email) {
      try {
        await sendEmail(
          email,
          'welcome', 
          [name, referral.campaign.name]  // Pass as array explicitly
        );
        console.log(`Welcome email sent to ${email}`);
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Don't fail the request if email fails
      }
    }

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

    const referral = await Referral.findById(referralId)
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

    // Send status update email if email is provided
    if (referredPerson.email) {
      try {
        if (status === 'contacted') {
          await sendEmail(
            referredPerson.email,
            'contacted',
            [referredPerson.name, referral.campaign.name]
          );
        } else if (status === 'converted') {
          await sendEmail(
            referredPerson.email,
            'converted',
            [referredPerson.name, referral.campaign.name, referral.campaign.rewardType, referral.campaign.rewardValue]
          );
        } else if (status === 'rejected') {
          await sendEmail(
            referredPerson.email,
            'rejected',
            [referredPerson.name, referral.campaign.name]
          );
        }
        console.log(`Status update email (${status}) sent to ${referredPerson.email}`);
      } catch (emailError) {
        console.error(`Error sending ${status} email:`, emailError);
        // Don't fail the request if email fails
      }
    }

    res.status(200).json({
      success: true,
      data: referral
    });
  } catch (err) {
    next(err);
  }
};

// Delete a referral
exports.deleteReferral = async (req, res, next) => {
  try {
    const referral = await Referral.findById(req.params.id);

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found'
      });
    }

    // Check if user owns this referral
    if (referral.business.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this referral'
      });
    }

    // Update campaign referral count
    await Campaign.findByIdAndUpdate(
      referral.campaign,
      { $inc: { referralCount: -1 } }
    );

    // Delete the referral
    await referral.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Referral deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
