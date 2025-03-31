const Message = require('../models/Message');
const Contact = require('../models/Contact');
const Referral = require('../models/Referral');
const { sendEmail } = require('../services/emailService');

// Create a new message (email or SMS)
exports.createMessage = async (req, res, next) => {
  try {
    const { type, subject, content, recipients, campaignId, scheduledFor, bulkSend, aiGenerated } = req.body;

    if (!type || !content || !recipients) {
      return res.status(400).json({
        success: false,
        message: 'Please provide message type, content, and recipients'
      });
    }

    if (type === 'email' && !subject) {
      return res.status(400).json({
        success: false,
        message: 'Subject is required for email messages'
      });
    }

    // Create message object with required fields
    const messageData = {
      type,
      subject,
      content,
      sender: req.user.id,
      recipients,
      scheduledFor,
      status: scheduledFor ? 'scheduled' : 'draft',
      bulkSend: bulkSend || false,
      aiGenerated: aiGenerated || false
    };

    // Only add campaignId if it's not empty
    if (campaignId) {
      messageData.campaign = campaignId;
    }

    const message = await Message.create(messageData);

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (err) {
    next(err);
  }
};

// Get all messages for a user
exports.getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ sender: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (err) {
    next(err);
  }
};

// Get a single message
exports.getMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if the message belongs to the authenticated user
    if (message.sender.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this message'
      });
    }

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (err) {
    next(err);
  }
};

// Send a message
exports.sendMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if the message belongs to the authenticated user
    if (message.sender.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to send this message'
      });
    }

    // Send emails to all recipients
    if (message.type === 'email') {
      const sendPromises = message.recipients.map(async (recipient) => {
        try {
          // Replace {{name}} placeholder with actual name if available
          let content = message.content;
          let subject = message.subject;
          
          // Try to find the contact to get their name
          const contact = await Contact.findOne({ email: recipient });
          if (contact) {
            content = content.replace(/{{name}}/g, contact.name);
            subject = subject.replace(/{{name}}/g, contact.name);
          }

          await sendEmail(
            recipient,
            subject,
            content
          );
        } catch (error) {
          console.error(`Error sending email to ${recipient}:`, error);
          // Continue with other recipients even if one fails
        }
      });

      // Wait for all emails to be sent
      await Promise.all(sendPromises);
    }

    // Update message status
    message.status = 'sent';
    message.sentAt = Date.now();
    await message.save();

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (err) {
    next(err);
  }
};

// Bulk import contacts and send message
exports.bulkImportAndSend = async (req, res, next) => {
  try {
    const { contacts, messageType, subject, content, campaignId } = req.body;

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid contacts provided'
      });
    }

    if (!messageType || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide message type and content'
      });
    }

    if (messageType === 'email' && !subject) {
      return res.status(400).json({
        success: false,
        message: 'Subject is required for email messages'
      });
    }

    // Extract recipients based on contact type
    const recipients = contacts.map(contact => 
      messageType === 'email' ? contact.email : contact.phone
    ).filter(Boolean);

    if (recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: `No valid ${messageType === 'email' ? 'email addresses' : 'phone numbers'} found in contacts`
      });
    }

    // Create message data object
    const messageData = {
      type: messageType,
      subject,
      content,
      sender: req.user.id,
      recipients,
      status: 'sent',
      sentAt: Date.now(),
      bulkSend: true
    };

    // Only add campaignId if it's not empty
    if (campaignId) {
      messageData.campaign = campaignId;
    }

    // Create bulk message
    const message = await Message.create(messageData);

    res.status(201).json({
      success: true,
      data: {
        message,
        recipientCount: recipients.length
      }
    });
  } catch (err) {
    next(err);
  }
};
