const nodemailer = require('nodemailer');

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Email templates
const templates = {
  welcome: (name, campaignName) => ({
    subject: `Welcome to ${campaignName}!`,
    html: `
      <h2>Welcome ${name}!</h2>
      <p>Thank you for your interest in our exclusive offer. We're excited to have you on board!</p>
      <p>Our team will review your information and get in touch with you shortly.</p>
      <p>Best regards,<br>Our Team</p>
    `
  }),
  contacted: (name, campaignName) => ({
    subject: `Update: We've Contacted You About ${campaignName}`,
    html: `
      <h2>Hello ${name},</h2>
      <p>We've reviewed your information and would like to discuss our offer with you.</p>
      <p>Our team will reach out to you shortly to provide more details.</p>
      <p>Best regards,<br>Our Team</p>
    `
  }),
  converted: (name, campaignName, rewardType, rewardValue) => ({
    subject: `Congratulations! You've Been Approved for ${campaignName}`,
    html: `
      <h2>Congratulations ${name}!</h2>
      <p>Great news! Your application has been approved.</p>
      <p>Your reward: ${rewardType === 'discount' ? `${rewardValue}% discount` : `$${rewardValue} cash reward`}</p>
      <p>Our team will contact you shortly with instructions on how to claim your reward.</p>
      <p>Best regards,<br>Our Team</p>
    `
  }),
  rejected: (name, campaignName) => ({
    subject: `Update: Application Status for ${campaignName}`,
    html: `
      <h2>Hello ${name},</h2>
      <p>Thank you for your interest in our offer.</p>
      <p>After careful review of your application, we regret to inform you that we are unable to proceed with your application at this time.</p>
      <p>If you have any questions about this decision, please don't hesitate to contact us.</p>
      <p>Best regards,<br>Our Team</p>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data) => {
  try {
    const { subject, html } = templates[template](...data);
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html
    });
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = {
  sendEmail,
  templates
}; 