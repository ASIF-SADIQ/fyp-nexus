// Email service with fallback for missing nodemailer
let nodemailer = null;

// Try to load nodemailer, but don't crash if it's not available
try {
  nodemailer = require('nodemailer');
  console.log('✅ Nodemailer loaded successfully');
} catch (error) {
  console.log('⚠️ Nodemailer not available, using fallback email service');
}

const User = require('../models/User');

// --- 1. FIXED CONFIGURATION ---
const createTransporter = () => {
  if (!nodemailer) return null;
  
  // ✅ FIX: Changed createTransporter to createTransport (Nodemailer standard)
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// --- 2. EMAIL TEMPLATES ---
const emailTemplates = {
  projectUpdate: (projectName, message, recipientName) => ({
    subject: `Project Update: ${projectName}`,
    html: `<div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; text-align: center; color: white;">
              <h1>NEXUS Project Portal</h1>
            </div>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h2>Hello ${recipientName},</h2>
              <p>Update for <strong>${projectName}</strong>:</p>
              <div style="background: white; padding: 15px; border-left: 4px solid #667eea;">${message}</div>
            </div>
          </div>`
  }),

  deadlineReminder: (projectName, deadline, recipientName) => ({
    subject: `Deadline Reminder: ${projectName}`,
    html: `<div style="font-family: Arial; padding: 20px;">
            <h2 style="color: #f5576c;">⏰ Deadline Reminder</h2>
            <p>Hello ${recipientName}, your project <strong>${projectName}</strong> has a deadline on ${new Date(deadline).toLocaleDateString()}.</p>
          </div>`
  }),

  gradeNotification: (projectName, grade, feedback, recipientName) => ({
    subject: `Grade Posted: ${projectName}`,
    html: `<div style="font-family: Arial; padding: 20px;">
            <h2>📊 Grade Posted</h2>
            <p><strong>Grade:</strong> ${grade}</p>
            <p><strong>Feedback:</strong> ${feedback}</p>
          </div>`
  }),

  taskAssignment: (taskTitle, projectName, description, recipientName) => ({
    subject: `New Task Assigned: ${taskTitle}`,
    html: `<div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 20px; border-radius: 10px; text-align: center; color: white;">
              <h1>📋 New Task Assigned</h1>
            </div>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h2>Hello ${recipientName},</h2>
              <p>Project: <strong>${projectName}</strong></p>
              <p><strong>Task:</strong> ${taskTitle}</p>
              <p><strong>Description:</strong> ${description}</p>
            </div>
          </div>`
  }),

  systemNotification: (title, message, recipientName) => ({
    subject: `System Notification: ${title}`,
    html: `<div style="font-family: Arial; padding: 20px;">
            <h2>🔔 ${title}</h2>
            <p>Hello ${recipientName}, ${message}</p>
          </div>`
  })
};

// --- 3. FIXED SEND EMAIL FUNCTION ---
const sendEmail = async (recipientId, type, data) => {
  try {
    const user = await User.findById(recipientId);
    if (!user) return false;

    if (!user.profileSetupComplete || !user.personalEmail) {
      console.log(`⚠️ User ${user.name} profile incomplete.`);
      return false;
    }

    // Mapping for user preferences
    const preferenceMap = {
      'System': 'systemNotifications',
      'Feedback': 'gradeNotifications',
      'Grade': 'gradeNotifications',
      'Deadline': 'deadlineReminders',
      'Task': 'taskAssignments',
      'taskAssignment': 'taskAssignments',
      'Approval': 'projectUpdates',
      'Rejection': 'projectUpdates'
    };
    
    const prefKey = preferenceMap[type] || 'systemNotifications';
    if (!user.emailPreferences[prefKey]) {
      console.log(`⚠️ User opted out of ${type} emails.`);
      return false;
    }

    // ✅ FIX: Improved Template Key Selection
    let templateKey = type.charAt(0).toLowerCase() + type.slice(1); // Standardize to camelCase
    if (templateKey === 'task') templateKey = 'taskAssignment';
    if (templateKey === 'system') templateKey = 'systemNotification';

    const template = emailTemplates[templateKey];
    if (!template) {
      console.error(`❌ No template found for type: ${type}`);
      return false;
    }

    // ✅ FIX: Template Argument Alignment
    let emailContent;
    if (templateKey === 'taskAssignment') {
      emailContent = template(data.taskTitle || data.title, data.projectName, data.description || data.message, user.name);
    } else if (templateKey === 'gradeNotification') {
      emailContent = template(data.projectName, data.grade, data.feedback, user.name);
    } else {
      emailContent = template(data.projectName || data.title, data.message || data.description, user.name);
    }

    if (!nodemailer) {
      console.log(`📧 FALLBACK: To: ${user.personalEmail} | Subject: ${emailContent.subject}`);
      return true;
    }

    const transporter = createTransporter();
    const mailOptions = {
      from: `"NEXUS Project Portal" <${process.env.EMAIL_USER}>`,
      to: user.personalEmail,
      ...emailContent
    };

    await transporter.sendMail(mailOptions);
    user.lastEmailSent = new Date();
    await user.save();

    console.log(`🎉 EMAIL SUCCESS: Sent to ${user.personalEmail}`);
    return true;

  } catch (error) {
    console.error('❌ EMAIL ERROR:', error.message);
    return false;
  }
};

// --- 4. BULK EMAILS ---
const sendProjectEmails = async (projectId, type, data, excludeUser = null) => {
  const Project = require('../models/Project');
  try {
    const project = await Project.findById(projectId).populate('members supervisor');
    if (!project) return 0;

    const recipients = [...(project.members || [])];
    if (project.supervisor) recipients.push(project.supervisor);

    const filteredRecipients = excludeUser 
      ? recipients.filter(r => r._id.toString() !== excludeUser.toString())
      : recipients;

    const emailPromises = filteredRecipients.map(recipient => sendEmail(recipient._id, type, data));
    const results = await Promise.allSettled(emailPromises);
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
    console.log(`📧 Sent ${successful} emails for project ${project.title}`);
    return successful;

  } catch (error) {
    console.error('Error sending project emails:', error);
    return 0;
  }
};

module.exports = { sendEmail, sendProjectEmails, emailTemplates };