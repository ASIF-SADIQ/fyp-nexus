const nodemailer = require('nodemailer');
const User = require('../models/User');

// 1. Create the connection to Gmail (Using your .env credentials)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Your 16-character App Password (no spaces)
  },
});

// 2. Professional Email Templates
const emailTemplates = {
  projectUpdate: (projectName, message, recipientName) => ({
    subject: `Project Update: ${projectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #4A90E2;">Hello ${recipientName},</h2>
        <p>There is an update for your project: <strong>${projectName}</strong></p>
        <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #4A90E2;">
          <p>${message}</p>
        </div>
        <p style="font-size: 12px; color: #999; margin-top: 20px;">Sent via NEXUS Project Portal</p>
      </div>`
  }),
  
  taskAssignment: (taskTitle, projectName, description, recipientName) => ({
    subject: `New Task: ${taskTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #F5A623;">📋 New Task Assigned</h2>
        <p>Hello ${recipientName}, you have a new task for <strong>${projectName}</strong>.</p>
        <p><strong>Task:</strong> ${taskTitle}</p>
        <p><strong>Details:</strong> ${description}</p>
      </div>`
  })
};

// 3. The Dispatch Function
const sendEmail = async (recipientId, type, data) => {
  try {
    // Lookup user in Atlas
    const user = await User.findById(recipientId);
    
    // Safety Checks
    if (!user) {
      console.error('❌ User not found');
      return false;
    }
    
    const targetEmail = user.personalEmail || user.email;
    if (!targetEmail) {
      console.error(`❌ No email address found for ${user.name}`);
      return false;
    }

    // Pick Template (Defaults to projectUpdate if type is missing)
    const templateFunc = emailTemplates[type] || emailTemplates.projectUpdate;
    
    // Generate Content
    const content = templateFunc(
      data.projectName || data.taskTitle || 'Project Update',
      data.message || data.description || 'No additional details provided.',
      user.name,
      data.projectName // used as 4th arg for taskAssignment
    );

    const mailOptions = {
      from: `"NEXUS Portal" <${process.env.EMAIL_USER}>`,
      to: targetEmail,
      subject: content.subject,
      html: content.html
    };

    // Send!
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email successfully delivered to: ${targetEmail}`);
    return true;
    
  } catch (error) {
    console.error('❌ Mailer Error:', error.message);
    return false;
  }
};

module.exports = { sendEmail, emailTemplates };